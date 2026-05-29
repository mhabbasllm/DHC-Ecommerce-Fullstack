using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace App_API.Models
{
    public class Coupon
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty; // e.g. "ALIBABA"

        [Required]
        [Column(TypeName = "decimal(5,2)")]
        public decimal DiscountPercent { get; set; } // e.g. 15.00 for 15%

        public DateTime ExpiryDate { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
