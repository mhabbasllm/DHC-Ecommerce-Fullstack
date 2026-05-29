using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace App_API.Models
{
    public class CartItem
    {
        [Key]
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;
        
        [JsonIgnore]
        public AppUser User { get; set; } = null!;

        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public int Quantity { get; set; } = 1;

        [MaxLength(50)]
        public string? Size { get; set; }

        [MaxLength(50)]
        public string? Color { get; set; }

        [MaxLength(100)]
        public string? Material { get; set; }

        public DateTime DateAdded { get; set; } = DateTime.UtcNow;
        public bool IsSavedForLater { get; set; } = false; // Cart vs Saved list support
    }
}
