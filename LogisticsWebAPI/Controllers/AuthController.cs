using LogisticsWebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using LogisticsWebAPI.DTOs.Auth;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
namespace LogisticsWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(UserContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var admin = _context.Admins.FirstOrDefault(a => a.Email == dto.Email);
        if(admin != null)
        {
            if(!VerifyPassword(dto.Password, admin.PasswordHash))
                return Unauthorized(new { message = "Неверный логин или пароль!"});

            var adminToken = GenerateToken(admin.Id, admin.Email, admin.FullName);

            return Ok(new { adminToken, admin.Id, admin.Email, admin.FullName, admin.NameOfCompany, role = "admin"});
        }

        var user = _context.Users.FirstOrDefault(u => u.Email == dto.Email);
        if(user != null)
        {
            if(!VerifyPassword(dto.Password, user.PasswordHash)) 
                return Unauthorized(new { message = "Неверный email или пароль!" });
            
            var token = GenerateToken(user.Id, user.Email, user.FullName);
            return Ok(new { token, user.Id, user.Email, user.FullName, role = "user"});
        }

        return Unauthorized(new { message = "Неверный Email или пароль!"});
    }
    
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if(_context.Users.Any(u => u.Email == dto.Email) || 
           _context.Admins.Any(a => a.Email == dto.Email))
            return BadRequest(new { message = "Email уже занят"});
            
        const string ADMIN_CODE = "LoGIstiCsPr04dM1n";

        if(!string.IsNullOrEmpty(dto.AdminCode))
        {
            if(dto.AdminCode == ADMIN_CODE)
            {
                var admin = new Admin
                {
                    FullName = dto.FullName,
                    Email = dto.Email,
                    NameOfCompany = dto.NameOfCompany,
                    PasswordHash = HashPassword(dto.Password),
                    Code = dto.AdminCode
                };
                
                _context.Admins.Add(admin);
                await _context.SaveChangesAsync();

                var adminToken = GenerateToken(admin.Id, admin.Email, admin.FullName);

                return Ok(new { adminToken, admin.Id, admin.Email, admin.FullName, admin.NameOfCompany, role = "admin"});
            } else
            {
                return BadRequest(new { message = "Неверный код доступа!" });
            }
        }

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            NameOfCompany = dto.NameOfCompany,
            PasswordHash = HashPassword(dto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateToken(user.Id, user.Email, user.FullName);
        
        return Ok(new { token, user.Id, user.Email, user.FullName, role = "User"});
    }

    private string GenerateToken(int Id, string Email, string FullName)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, Id.ToString()),
            new Claim(ClaimTypes.Email, Email),
            new Claim("FullName", FullName)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(1),
            signingCredentials: credentials
        ); 
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    private string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }
    
    private bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
}