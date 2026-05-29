using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace App_API.Models
{
    public class Inquiry
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string ItemName { get; set; } = string.Empty; // "What item you need?"

        [Required]
        public string Details { get; set; } = string.Empty; // "Type more details"

        [Required]
        public int Quantity { get; set; }

        [Required]
        [MaxLength(20)]
        public string Unit { get; set; } = "Pcs"; // "Pcs", "Kg"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? UserId { get; set; }
        
        [JsonIgnore]
        public AppUser? User { get; set; }
    }
}
