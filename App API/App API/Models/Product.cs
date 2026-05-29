using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace App_API.Models
{
    public class Product
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(250)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? OldPrice { get; set; }

        public string? ImageUrl { get; set; }
        public List<string> ThumbnailUrls { get; set; } = new List<string>();

        public double Rating { get; set; } = 0.0;
        public int RatingCount { get; set; } = 0;
        public int TotalOrders { get; set; } = 0;
        public bool FreeShipping { get; set; } = false;
        public int StockQuantity { get; set; } = 0;
        public bool IsNegotiable { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string Warranty { get; set; } = "No Warranty";

        // Foreign Keys
        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        public Guid SupplierId { get; set; }
        public Supplier Supplier { get; set; } = null!;

        public ICollection<ProductSpecification> Specifications { get; set; } = new List<ProductSpecification>();
        
        [JsonIgnore]
        public ICollection<Deal> Deals { get; set; } = new List<Deal>();
    }
}
