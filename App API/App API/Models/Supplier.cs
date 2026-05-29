using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace App_API.Models
{
    public class Supplier
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string CompanyName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Country { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        public bool IsVerified { get; set; } = false;
        public bool WorldwideShipping { get; set; } = true;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
