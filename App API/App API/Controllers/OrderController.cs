using System.Security.Claims;
using App_API.Data;
using App_API.Models;
using App_API.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;

namespace App_API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<StoreHub> _hubContext;

        public OrderController(AppDbContext context, IHubContext<StoreHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        private string GetCurrentUserId()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdString))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }
            return userIdString;
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders()
        {
            try
            {
                var userId = GetCurrentUserId();
                var orders = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .Where(o => o.UserId == userId)
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync();

                return Ok(orders);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

                if (order == null) return NotFound("Order not found.");

                return Ok(order);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
        }

        [HttpGet("coupon/{code}")]
        [AllowAnonymous]
        public async Task<IActionResult> ValidateCoupon(string code)
        {
            var coupon = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code.ToUpper() == code.ToUpper() && c.IsActive);

            if (coupon == null)
            {
                return NotFound(new { IsValid = false, Message = "Invalid or inactive coupon." });
            }

            if (coupon.ExpiryDate < DateTime.UtcNow)
            {
                return BadRequest(new { IsValid = false, Message = "This coupon has expired." });
            }

            return Ok(new
            {
                IsValid = true,
                Code = coupon.Code,
                DiscountPercent = coupon.DiscountPercent
            });
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutDto model)
        {
            try
            {
                var userId = GetCurrentUserId();

                // Fetch active cart items (not saved for later)
                var cartItems = await _context.CartItems
                    .Include(ci => ci.Product)
                    .Where(ci => ci.UserId == userId && !ci.IsSavedForLater)
                    .ToListAsync();

                if (!cartItems.Any())
                {
                    return BadRequest("Your shopping cart is empty.");
                }

                // Check stock quantities
                foreach (var item in cartItems)
                {
                    if (item.Product.StockQuantity < item.Quantity)
                    {
                        return BadRequest($"Insufficient stock for product: '{item.Product.Title}'. Available: {item.Product.StockQuantity}");
                    }
                }

                // Calculate Subtotal
                decimal subtotal = cartItems.Sum(item => item.Product.Price * item.Quantity);
                decimal discountAmount = 0.00m;
                Coupon? coupon = null;

                // Validate and apply coupon if provided
                if (!string.IsNullOrWhiteSpace(model.CouponCode))
                {
                    coupon = await _context.Coupons
                        .FirstOrDefaultAsync(c => c.Code.ToUpper() == model.CouponCode.ToUpper() && c.IsActive && c.ExpiryDate > DateTime.UtcNow);

                    if (coupon != null)
                    {
                        discountAmount = subtotal * (coupon.DiscountPercent / 100m);
                    }
                }

                decimal taxableAmount = Math.Max(0.00m, subtotal - discountAmount);
                decimal tax = Math.Round(taxableAmount * 0.05m, 2); // 5% tax
                decimal total = taxableAmount + tax;

                // Generate Order
                var order = new Order
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    OrderDate = DateTime.UtcNow,
                    Subtotal = subtotal,
                    DiscountAmount = discountAmount,
                    Tax = tax,
                    Total = total,
                    Status = "Pending",
                    ShippingAddress = model.ShippingAddress,
                    CouponId = coupon?.Id
                };

                // Add Order Items and decrease stock
                foreach (var item in cartItems)
                {
                    var orderItem = new OrderItem
                    {
                        OrderId = order.Id,
                        ProductId = item.ProductId,
                        UnitPrice = item.Product.Price,
                        Quantity = item.Quantity,
                        Size = item.Size,
                        Color = item.Color,
                        Material = item.Material
                    };

                    order.OrderItems.Add(orderItem);

                    // Deduct inventory stock
                    item.Product.StockQuantity -= item.Quantity;
                    item.Product.TotalOrders += item.Quantity;
                }

                _context.Orders.Add(order);

                // Clear active cart items
                _context.CartItems.RemoveRange(cartItems);

                // Create persistent notification for admins
                var currentUserName = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst("fullName")?.Value ?? "A Customer";
                var notification = new Notification
                {
                    Title = "New Order Received",
                    Message = $"{currentUserName} placed an order for ${total:N2}.",
                    Type = "Success",
                    CreatedAt = DateTime.UtcNow,
                    TargetUrl = $"/admin/orders"
                };
                _context.Notifications.Add(notification);

                await _context.SaveChangesAsync();

                // Notify Admins in Real-time
                await _hubContext.Clients.All.SendAsync("ReceiveNewOrder", new
                {
                    Id = order.Id.ToString(),
                    Customer = currentUserName,
                    TotalAmount = order.Total,
                    OrderDate = order.OrderDate,
                    Status = order.Status
                });

                return Ok(new
                {
                    Message = "Order placed successfully!",
                    OrderId = order.Id,
                    Total = order.Total
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
        }
    }

    public record CheckoutDto(string ShippingAddress, string? CouponCode);
}
