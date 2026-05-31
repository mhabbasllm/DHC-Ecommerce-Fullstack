using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using App_API.Data;
using App_API.Models;
using App_API.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;

namespace App_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<AppUser> _userManager;
        private readonly IHubContext<StoreHub> _hubContext;

        public AdminController(AppDbContext context, UserManager<AppUser> userManager, IHubContext<StoreHub> hubContext)
        {
            _context = context;
            _userManager = userManager;
            _hubContext = hubContext;
        }

        #region User Management (SuperAdmin Only)

        [Authorize(Roles = "Admin")]
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userList = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.IsActive,
                    user.JoinAt,
                    Roles = roles
                });
            }

            return Ok(userList);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("users/{userId}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("User not found");

            // Prevent super admin from disabling themselves
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser?.Id == user.Id) return BadRequest("You cannot disable your own account.");

            user.IsActive = !user.IsActive;
            await _userManager.UpdateAsync(user);

            return Ok(new { message = $"User {(user.IsActive ? "activated" : "deactivated")} successfully", isActive = user.IsActive });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] RegisterAdminDto model)
        {
            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null) return BadRequest("Email already in use");

            var user = new AppUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                FullName = $"{model.FirstName} {model.LastName}".Trim(),
                JoinAt = DateTime.UtcNow,
                IsActive = true
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, "Admin");

            return Ok(new { message = "Admin account created successfully" });
        }

        #endregion

        #region Supplier Management

        [HttpGet("suppliers")]
        public async Task<IActionResult> GetSuppliers()
        {
            return Ok(await _context.Suppliers.ToListAsync());
        }

        [HttpPost("suppliers")]
        public async Task<IActionResult> CreateSupplier([FromBody] Supplier model)
        {
            model.Id = Guid.NewGuid();
            model.JoinedAt = DateTime.UtcNow;
            _context.Suppliers.Add(model);
            await _context.SaveChangesAsync();
            return Ok(model);
        }

        [HttpPut("suppliers/{id}")]
        public async Task<IActionResult> UpdateSupplier(Guid id, [FromBody] Supplier model)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return NotFound();

            supplier.CompanyName = model.CompanyName;
            supplier.Country = model.Country;
            supplier.City = model.City;
            supplier.IsVerified = model.IsVerified;
            supplier.WorldwideShipping = model.WorldwideShipping;

            await _context.SaveChangesAsync();
            return Ok(supplier);
        }

        [HttpDelete("suppliers/{id}")]
        public async Task<IActionResult> DeleteSupplier(Guid id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return NotFound();

            _context.Suppliers.Remove(supplier);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Supplier deleted successfully" });
        }

        #endregion

        #region Dashboard Stats

        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                // Basic counts
                var totalProducts = await _context.Products.CountAsync();
                var totalOrders = await _context.Orders.CountAsync();
                var totalUsers = await _userManager.Users.CountAsync(u => u.IsActive);

                // SQLite cannot translate decimal Sum reliably, so aggregate the selected
                // totals in memory after the database has returned only that column.
                var orderTotals = await _context.Orders
                    .Select(o => o.Total)
                    .ToListAsync();
                var totalSales = orderTotals.Sum();

                // Recent orders with safety checks
                var recentOrders = await _context.Orders
                    .Include(o => o.User)
                    .OrderByDescending(o => o.OrderDate)
                    .Take(5)
                    .Select(o => new {
                        o.Id,
                        Customer = o.User != null ? o.User.FullName : "Guest",
                        totalAmount = o.Total, // Match frontend naming convention (camelCase)
                        o.Status,
                        o.OrderDate
                    })
                    .ToListAsync();

                return Ok(new
                {
                    totalProducts,
                    totalOrders,
                    totalUsers,
                    totalSales,
                    recentOrders
                });
            }
            catch (Exception ex)
            {
                // Detailed server-side logging
                Console.WriteLine("DASHBOARD STATS ERROR LOG START");
                Console.WriteLine($"Message: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                Console.WriteLine("DASHBOARD STATS ERROR LOG END");

                return StatusCode(500, new { 
                    error = "Failed to fetch dashboard statistics",
                    details = ex.Message,
                    hint = "Check server logs for full stack trace."
                });
            }
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetAdminOrders()
        {
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .OrderByDescending(o => o.OrderDate)
                    .Select(o => new {
                        o.Id,
                        o.OrderDate,
                        CustomerName = o.User != null ? o.User.FullName : "Guest",
                        CustomerEmail = o.User != null ? o.User.Email : "No Email",
                        o.Status,
                        o.ShippingAddress,
                        o.Subtotal,
                        o.DiscountAmount,
                        o.Tax,
                        TotalAmount = o.Total,
                        ItemCount = o.OrderItems.Count
                    })
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    error = ex.Message 
                });
            }
        }

        [HttpGet("orders/{orderId}")]
        public async Task<IActionResult> GetAdminOrderDetails(Guid orderId)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .Where(o => o.Id == orderId)
                    .Select(o => new {
                        o.Id,
                        o.OrderDate,
                        CustomerName = o.User != null ? o.User.FullName : "Guest",
                        CustomerEmail = o.User != null ? o.User.Email : "No Email",
                        o.Status,
                        o.ShippingAddress,
                        o.Subtotal,
                        o.DiscountAmount,
                        o.Tax,
                        TotalAmount = o.Total,
                        ItemCount = o.OrderItems.Count,
                        Items = o.OrderItems.Select(oi => new {
                            oi.Id,
                            oi.ProductId,
                            ProductTitle = oi.Product != null ? oi.Product.Title : "Deleted product",
                            ImageUrl = oi.Product != null ? oi.Product.ImageUrl : null,
                            oi.Quantity,
                            oi.UnitPrice,
                            oi.Size,
                            oi.Color,
                            oi.Material
                        }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (order == null) return NotFound("Order not found.");

                return Ok(order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new {
                    error = ex.Message
                });
            }
        }

        [HttpPost("orders/{orderId}/status")]
        public async Task<IActionResult> UpdateOrderStatus(Guid orderId, [FromBody] string status)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null) return NotFound("Order not found.");

            order.Status = status;
            await _context.SaveChangesAsync();

            // Notify user and admins of status update
            await _hubContext.Clients.All.SendAsync("OrderStatusUpdated", new {
                orderId = orderId,
                status = order.Status,
                userId = order.UserId
            });

            return Ok(new { message = "Order status updated successfully", status = order.Status });
        }

        #endregion

        #region Notifications

        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications()
        {
            var notifications = await _context.Notifications
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .ToListAsync();
            return Ok(notifications);
        }

        [HttpPost("notifications/{id}/read")]
        public async Task<IActionResult> MarkNotificationAsRead(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("notifications/mark-all-read")]
        public async Task<IActionResult> MarkAllNotificationsAsRead()
        {
            var unread = await _context.Notifications.Where(n => !n.IsRead).ToListAsync();
            unread.ForEach(n => n.IsRead = true);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("notifications/{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null) return NotFound();

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
            return Ok();
        }

        #endregion
    }

    public class RegisterAdminDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }
}
