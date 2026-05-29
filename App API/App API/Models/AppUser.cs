using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace App_API.Models
{
    public class AppUser : IdentityUser
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        [Required]
        [MaxLength(100)]
        public string? FullName { get; set; }

        public string? Gender { get; set; }

        public DateTime JoinAt { get; set; }
        public bool IsActive { get; set; }

        // Navigation Properties
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<Inquiry> Inquiries { get; set; } = new List<Inquiry>();
    }
}
