using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using App_API.Models;

namespace App_API.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }


        public DbSet<Category> Categories { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductSpecification> ProductSpecifications { get; set; }
        public DbSet<Deal> Deals { get; set; }
        public DbSet<Inquiry> Inquiries { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<NewsletterSubscription> NewsletterSubscriptions { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Unique constraint for Coupon Code
            modelBuilder.Entity<Coupon>()
                .HasIndex(c => c.Code)
                .IsUnique();

            // Self-referencing relationship for Category Hierarchy
            modelBuilder.Entity<Category>()
                .HasOne(c => c.ParentCategory)
                .WithMany(c => c.SubCategories)
                .HasForeignKey(c => c.ParentCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Restrict Deletes to prevent circular cascading loops
            modelBuilder.Entity<Product>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Product>()
                .HasOne(p => p.Supplier)
                .WithMany(s => s.Products)
                .HasForeignKey(p => p.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CartItem>()
                .HasOne(ci => ci.User)
                .WithMany(u => u.CartItems)
                .HasForeignKey(ci => ci.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Deal>()
                .HasOne(d => d.Product)
                .WithMany(p => p.Deals)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<IdentityRole>().HasData(MigrationSeedData.Roles);
            modelBuilder.Entity<AppUser>().HasData(MigrationSeedData.AdminUsers);
            modelBuilder.Entity<IdentityUserRole<string>>().HasData(MigrationSeedData.UserRoles);

            modelBuilder.Entity<Category>().HasData(MigrationSeedData.Categories);
            modelBuilder.Entity<Supplier>().HasData(MigrationSeedData.Suppliers);
            modelBuilder.Entity<Product>().HasData(MigrationSeedData.Products);
            modelBuilder.Entity<ProductSpecification>().HasData(MigrationSeedData.ProductSpecifications);
            modelBuilder.Entity<Deal>().HasData(MigrationSeedData.Deals);
            modelBuilder.Entity<Coupon>().HasData(MigrationSeedData.Coupons);
            modelBuilder.Entity<Service>().HasData(MigrationSeedData.Services);
        }
    }
}
