using System.Security.Claims;
using App_API.Data;
using App_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace App_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InquiryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InquiryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitInquiry([FromBody] InquirySubmitDto model)
        {
            string? userId = null;
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (!string.IsNullOrEmpty(userIdString))
            {
                userId = userIdString;
            }

            var inquiry = new Inquiry
            {
                Id = Guid.NewGuid(),
                ItemName = model.ItemName,
                Details = model.Details,
                Quantity = model.Quantity,
                Unit = model.Unit ?? "Pcs",
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            };

            _context.Inquiries.Add(inquiry);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Sourcing inquiry submitted successfully!", InquiryId = inquiry.Id });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetInquiries()
        {
            var inquiries = await _context.Inquiries
                .Include(i => i.User)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return Ok(inquiries);
        }
    }

    public record InquirySubmitDto(string ItemName, string Details, int Quantity, string? Unit);
}
