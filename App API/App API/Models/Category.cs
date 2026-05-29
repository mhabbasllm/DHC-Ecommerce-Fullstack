using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace App_API.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public int? ParentCategoryId { get; set; }
        [JsonIgnore]
        public Category? ParentCategory { get; set; }

        public ICollection<Category> SubCategories { get; set; } = new List<Category>();
        
        [JsonIgnore]
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
