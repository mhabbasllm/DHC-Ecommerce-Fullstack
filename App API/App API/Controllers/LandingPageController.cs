using App_API.Data;
using App_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace App_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LandingPageController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LandingPageController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("services")]
        public async Task<IActionResult> GetServices()
        {
            var services = await _context.Services.ToListAsync();
            return Ok(services);
        }

        [HttpGet("suppliers")]
        public async Task<IActionResult> GetSuppliers()
        {
            var suppliers = await _context.Suppliers.ToListAsync();
            return Ok(suppliers);
        }

        [HttpPost("newsletter")]
        public async Task<IActionResult> SubscribeNewsletter([FromBody] NewsletterSubscribeDto model)
        {
            if (string.IsNullOrWhiteSpace(model.Email))
            {
                return BadRequest("Email is required.");
            }

            var alreadySubscribed = await _context.NewsletterSubscriptions
                .AnyAsync(ns => ns.Email.ToLower() == model.Email.ToLower());

            if (alreadySubscribed)
            {
                return Ok(new { Message = "You are already subscribed to our newsletter!" });
            }

            var subscription = new NewsletterSubscription
            {
                Email = model.Email,
                SubscribedAt = DateTime.UtcNow
            };

            _context.NewsletterSubscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Thank you for subscribing to our newsletter!" });
        }
    }

    public record NewsletterSubscribeDto(string Email);
}
