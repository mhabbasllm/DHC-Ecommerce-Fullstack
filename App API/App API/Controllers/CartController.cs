using System.Security.Claims;
using App_API.Data;
using App_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace App_API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
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
        public async Task<IActionResult> GetCart()
        {
            try
            {
                var userId = GetCurrentUserId();
                var cartItems = await _context.CartItems
                    .Include(ci => ci.Product)
                    .Where(ci => ci.UserId == userId)
                    .ToListAsync();

                return Ok(cartItems);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto model)
        {
            try
            {
                var userId = GetCurrentUserId();

                var product = await _context.Products.FindAsync(model.ProductId);
                if (product == null) return NotFound("Product not found.");

                // Check if identical item (same product and variant choices) already exists in user's cart
                var existingItem = await _context.CartItems
                    .FirstOrDefaultAsync(ci => ci.UserId == userId && 
                                               ci.ProductId == model.ProductId && 
                                               ci.Size == model.Size && 
                                               ci.Color == model.Color && 
                                               ci.Material == model.Material &&
                                               ci.IsSavedForLater == model.IsSavedForLater);

                if (existingItem != null)
                {
                    existingItem.Quantity += model.Quantity;
                }
                else
                {
                    var cartItem = new CartItem
                    {
                        UserId = userId,
                        ProductId = model.ProductId,
                        Quantity = model.Quantity,
                        Size = model.Size,
                        Color = model.Color,
                        Material = model.Material,
                        IsSavedForLater = model.IsSavedForLater
                    };
                    _context.CartItems.Add(cartItem);
                }

                await _context.SaveChangesAsync();
                return Ok(new { Message = "Item added to cart successfully!" });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCartItem(int id, [FromBody] UpdateCartItemDto model)
        {
            try
            {
                var userId = GetCurrentUserId();
                var cartItem = await _context.CartItems.FirstOrDefaultAsync(ci => ci.Id == id && ci.UserId == userId);
                if (cartItem == null) return NotFound("Cart item not found.");

                if (model.Quantity.HasValue)
                {
                    if (model.Quantity.Value <= 0)
                    {
                        _context.CartItems.Remove(cartItem);
                    }
                    else
                    {
                        cartItem.Quantity = model.Quantity.Value;
                    }
                }

                if (model.IsSavedForLater.HasValue)
                {
                    cartItem.IsSavedForLater = model.IsSavedForLater.Value;
                }

                await _context.SaveChangesAsync();
                return Ok(new { Message = "Cart updated successfully!" });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveFromCart(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var cartItem = await _context.CartItems.FirstOrDefaultAsync(ci => ci.Id == id && ci.UserId == userId);
                if (cartItem == null) return NotFound("Cart item not found.");

                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Item removed from cart." });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            try
            {
                var userId = GetCurrentUserId();
                var cartItems = await _context.CartItems.Where(ci => ci.UserId == userId).ToListAsync();
                
                _context.CartItems.RemoveRange(cartItems);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Cart cleared successfully!" });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
        }
    }

    public record AddToCartDto(Guid ProductId, int Quantity, string? Size, string? Color, string? Material, bool IsSavedForLater = false);
    public record UpdateCartItemDto(int? Quantity, bool? IsSavedForLater);
}
