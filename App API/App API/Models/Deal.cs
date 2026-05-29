using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace App_API.Models
{
    public class Deal
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal DiscountPercent { get; set; } // e.g. 25.00 for -25%

        [Required]
        public DateTime EndDate { get; set; } // For countdown timer

        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;
    }
}
