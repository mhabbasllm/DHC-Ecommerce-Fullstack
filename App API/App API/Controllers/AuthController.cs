using App_API.Data;
using App_API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace App_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<AppUser> _userManager;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context,UserManager<AppUser> userManager, IConfiguration config)
        {
            _context = context;
            _userManager = userManager;
            _config = config;
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if(model is null)
                return BadRequest("Invalide Request");

            var User = new AppUser
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                FullName = $"{model.FirstName} {model.LastName}".Trim(),
                Gender = model.Gender,
                JoinAt = DateTime.Now,
                IsActive = true
            };

            var result = await _userManager.CreateAsync(User, model.Password!);
            await _userManager.AddToRoleAsync(User, "Customer");
            

            if (!result.Succeeded)
                return BadRequest(result.Errors);


            return Ok(new
            {
                Email = model.Email,
                Password = model.Password
            });
            
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email!);
            if (user == null)
                return BadRequest(new { message = "User Name or Password is incorrect" });

            if (!user.IsActive)
                return BadRequest(new { message = "This account has been disabled. Please contact support." });

            if (await _userManager.CheckPasswordAsync(user, model.Password!))
            {
                var roles = await _userManager.GetRolesAsync(user);
                var signInKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(_config["AppSettings:JWTSecret"]!));

                var claims = new List<Claim>
                {
                    new Claim("UserID", user.Id),
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                };

                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = DateTime.UtcNow.AddMonths(1),
                    SigningCredentials = new SigningCredentials(
                        signInKey, SecurityAlgorithms.HmacSha256Signature)
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                var securityToken = tokenHandler.CreateToken(tokenDescriptor);
                var token = tokenHandler.WriteToken(securityToken);

                return Ok(new { token });
            }
            else
                return BadRequest(new { message = "User Name or Password is incorrect" });
        }

        
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var UserIdClaim = User.Claims.FirstOrDefault(c => c.Type == "UserID");

                if(UserIdClaim is null)
                    return Unauthorized("User ID Claim is not found");

                var user = await _userManager.FindByIdAsync(UserIdClaim.Value);
                if (user == null) return NotFound();

                var roles = await _userManager.GetRolesAsync(user);

                return Ok(new
                {
                    user.Id,
                    user.FirstName,
                    user.LastName,
                    user.FullName,
                    user.Gender,
                    user.Email,
                    user.JoinAt,
                    Roles = roles
                });
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while retrieving user profile");
            }
        }


        private async Task<IActionResult> ProfileData(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest("User ID is required");
            }

            try
            {
                var user = await _userManager.Users
                    .Where(u => u.Id == id)
                    .Select(u => new
                    {
                        u.Id,
                        u.FirstName,
                        u.LastName,
                        u.FullName,
                        u.Gender,
                        u.Email,
                        u.JoinAt,
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound($"User with ID {id} not found");
                }

                return Ok(user);
            }
            catch (Exception)
            {
                // Log the exception here
                return StatusCode(500, "An error occurred while retrieving user data");
            }
        }

    }

    public class RegisterDto
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Gender { get; set; }
    };
    public class LoginDto
    {
        public string? Email {  get; set; }
        public string? Password { get; set; }
    }
}
