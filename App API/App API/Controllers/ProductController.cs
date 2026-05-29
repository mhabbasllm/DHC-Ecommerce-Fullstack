using App_API.Data;
using App_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace App_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts(
            [FromQuery] string? search,
            [FromQuery] int? categoryId,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] bool? freeShipping,
            [FromQuery] bool? verifiedSupplier,
            [FromQuery] string? sortBy, // "price_asc", "price_desc", "newest", "rating", "orders"
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Specifications)
                .AsQueryable();

            // 1. Search filter
            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(p => p.Title.ToLower().Contains(lowerSearch) || 
                                         p.Description.ToLower().Contains(lowerSearch));
            }

            // 2. Category filter
            if (categoryId.HasValue)
            {
                // Include products in this category or any child subcategories
                var subCategoryIds = await _context.Categories
                    .Where(c => c.ParentCategoryId == categoryId.Value)
                    .Select(c => c.Id)
                    .ToListAsync();

                subCategoryIds.Add(categoryId.Value);

                query = query.Where(p => subCategoryIds.Contains(p.CategoryId));
            }

            // 3. Price filters
            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Price >= minPrice.Value);
            }
            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= maxPrice.Value);
            }

            // 4. Free shipping filter
            if (freeShipping.HasValue && freeShipping.Value)
            {
                query = query.Where(p => p.FreeShipping);
            }

            // 5. Verified supplier filter
            if (verifiedSupplier.HasValue && verifiedSupplier.Value)
            {
                query = query.Where(p => p.Supplier.IsVerified);
            }

            // 6. Sorting
            query = sortBy?.ToLower() switch
            {
                "price_asc" => query.OrderBy(p => p.Price),
                "price_desc" => query.OrderByDescending(p => p.Price),
                "newest" => query.OrderByDescending(p => p.CreatedAt),
                "rating" => query.OrderByDescending(p => p.Rating),
                "orders" => query.OrderByDescending(p => p.TotalOrders),
                _ => query.OrderByDescending(p => p.CreatedAt) // Default sorting
            };

            // 7. Pagination
            var totalCount = await query.CountAsync();
            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                TotalItems = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                Items = products
            });
        }

        [HttpGet("deals")]
        public async Task<IActionResult> GetFlashDeals()
        {
            var deals = await _context.Deals
                .Include(d => d.Product)
                .Where(d => d.EndDate > DateTime.UtcNow)
                .ToListAsync();

            return Ok(deals);
        }

        [HttpGet("homepage-sections")]
        public async Task<IActionResult> GetHomepageSections()
        {
            var dealsAndOffers = await _context.Deals
                .Include(d => d.Product)
                .Where(d => d.EndDate > DateTime.UtcNow)
                .OrderByDescending(d => (double)d.DiscountPercent)
                .Take(5)
                .Select(d => new
                {
                    d.Id,
                    d.DiscountPercent,
                    d.EndDate,
                    Product = new
                    {
                        d.Product.Id,
                        d.Product.Title,
                        d.Product.Description,
                        d.Product.Price,
                        d.Product.OldPrice,
                        d.Product.ImageUrl,
                        d.Product.Rating,
                        d.Product.RatingCount,
                        d.Product.TotalOrders,
                        d.Product.FreeShipping
                    }
                })
                .ToListAsync();

            var homeAndOutdoor = await GetProductsForCategories(
                new[] { "Home and outdoor", "Home and office" },
                8);

            var consumerElectronics = await GetProductsForCategories(
                new[] { "Consumer electronics and gadgets", "Computer and tech", "Smart devices" },
                8);

            var recommendedItems = await GetProductsForCategories(
                new[] { "Recommended items", "Clothes and wear", "Sports and outdoor" },
                10);

            return Ok(new
            {
                DealsAndOffers = dealsAndOffers,
                HomeAndOutdoor = homeAndOutdoor,
                ConsumerElectronics = consumerElectronics,
                RecommendedItems = recommendedItems
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(Guid id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Specifications)
                .Include(p => p.Deals)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { Message = "Product not found." });
            }

            return Ok(product);
        }

        private async Task<List<ProductCardDto>> GetProductsForCategories(string[] categoryNames, int take)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Where(p => categoryNames.Contains(p.Category.Name))
                .OrderByDescending(p => p.Rating)
                .ThenByDescending(p => p.TotalOrders)
                .Take(take)
                .Select(p => new ProductCardDto(
                    p.Id,
                    p.Title,
                    p.Description,
                    p.Price,
                    p.OldPrice,
                    p.ImageUrl,
                    p.Rating,
                    p.RatingCount,
                    p.TotalOrders,
                    p.FreeShipping,
                    p.Category.Name))
                .ToListAsync();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] ProductCreateDto model)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == model.CategoryId);
            if (!categoryExists) return BadRequest("Invalid Category ID.");

            var supplierExists = await _context.Suppliers.AnyAsync(s => s.Id == model.SupplierId);
            if (!supplierExists) return BadRequest("Invalid Supplier ID.");

            var product = new Product
            {
                Id = Guid.NewGuid(),
                Title = model.Title,
                Description = model.Description,
                Price = model.Price,
                OldPrice = model.OldPrice,
                ImageUrl = model.ImageUrl,
                ThumbnailUrls = model.ThumbnailUrls ?? new List<string>(),
                Rating = 0.0,
                RatingCount = 0,
                TotalOrders = 0,
                FreeShipping = model.FreeShipping,
                StockQuantity = model.StockQuantity,
                IsNegotiable = model.IsNegotiable,
                Warranty = model.Warranty,
                CategoryId = model.CategoryId,
                SupplierId = model.SupplierId
            };

            _context.Products.Add(product);

            if (model.Specifications != null && model.Specifications.Any())
            {
                foreach (var spec in model.Specifications)
                {
                    _context.ProductSpecifications.Add(new ProductSpecification
                    {
                        Name = spec.Name,
                        Value = spec.Value,
                        ProductId = product.Id
                    });
                }
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] ProductUpdateDto model)
        {
            var product = await _context.Products
                .Include(p => p.Specifications)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound("Product not found.");

            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == model.CategoryId);
            if (!categoryExists) return BadRequest("Invalid Category ID.");

            var supplierExists = await _context.Suppliers.AnyAsync(s => s.Id == model.SupplierId);
            if (!supplierExists) return BadRequest("Invalid Supplier ID.");

            product.Title = model.Title;
            product.Description = model.Description;
            product.Price = model.Price;
            product.OldPrice = model.OldPrice;
            product.ImageUrl = model.ImageUrl;
            product.ThumbnailUrls = model.ThumbnailUrls ?? new List<string>();
            product.FreeShipping = model.FreeShipping;
            product.StockQuantity = model.StockQuantity;
            product.IsNegotiable = model.IsNegotiable;
            product.Warranty = model.Warranty;
            product.CategoryId = model.CategoryId;
            product.SupplierId = model.SupplierId;

            // Clear old specifications and add new ones
            _context.ProductSpecifications.RemoveRange(product.Specifications);
            if (model.Specifications != null && model.Specifications.Any())
            {
                foreach (var spec in model.Specifications)
                {
                    _context.ProductSpecifications.Add(new ProductSpecification
                    {
                        Name = spec.Name,
                        Value = spec.Value,
                        ProductId = product.Id
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(product);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound("Product not found.");

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Product deleted successfully!" });
        }
    }

    public record SpecDto(string Name, string Value);
    public record ProductCardDto(
        Guid Id,
        string Title,
        string Description,
        decimal Price,
        decimal? OldPrice,
        string? ImageUrl,
        double Rating,
        int RatingCount,
        int TotalOrders,
        bool FreeShipping,
        string Category);

    public record ProductCreateDto(
        string Title, string Description, decimal Price, decimal? OldPrice, string? ImageUrl, 
        List<string>? ThumbnailUrls, bool FreeShipping, int StockQuantity, bool IsNegotiable, 
        string Warranty, int CategoryId, Guid SupplierId, List<SpecDto>? Specifications);

    public record ProductUpdateDto(
        string Title, string Description, decimal Price, decimal? OldPrice, string? ImageUrl, 
        List<string>? ThumbnailUrls, bool FreeShipping, int StockQuantity, bool IsNegotiable, 
        string Warranty, int CategoryId, Guid SupplierId, List<SpecDto>? Specifications);
}
