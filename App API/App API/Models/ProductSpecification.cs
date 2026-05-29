using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace App_API.Models
{
    public class ProductSpecification
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty; // e.g. "Model", "Memory", "Size"

        [Required]
        [MaxLength(250)]
        public string Value { get; set; } = string.Empty; // e.g. "36GB RAM", "ISO-8989"

        public Guid ProductId { get; set; }
        
        [JsonIgnore]
        public Product Product { get; set; } = null!;
    }
}
