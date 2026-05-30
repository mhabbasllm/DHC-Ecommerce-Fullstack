using System.ComponentModel.DataAnnotations;

namespace App_API.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsRead { get; set; } = false;

        [MaxLength(50)]
        public string Type { get; set; } = "Info"; // Info, Success, Warning, Error
        
        // Optional link to related entity
        public string? TargetUrl { get; set; }
    }
}
