using System.ComponentModel.DataAnnotations;

namespace App_API.Models
{
    public class Service
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string IconName { get; set; } = string.Empty; // Lucide icon lookup code

        [Required]
        public string ImageUrl { get; set; } = string.Empty;
    }
}
