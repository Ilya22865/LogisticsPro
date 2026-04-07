using LogisticsWebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using LogisticsWebAPI.DTOs.Auth;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;
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
        var user = _context.Users.FirstOrDefault(u => u.Email == dto.Email);
        if (user == null)
            return Unauthorized(new { message = "Неверный Email или пароль!" });

        if (!VerifyPassword(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Неверный Email или пароль!" });

        var token = GenerateToken(user.Id, user.Email, user.FullName, user.Role);
        return Ok(new { token, user.Id, user.Email, user.FullName, user.NameOfCompany, user.CompanyId, role = user.Role.ToString() });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var config = _configuration.GetSection("Hunter");
        var AdminCodeConf = _configuration.GetSection("AdminCode");
        var ADMIN_CODE = AdminCodeConf["Code"];
        string hunterKey = config["ApiKey"]!;
        bool isEmailValid;

        isEmailValid = await ValidEmailAsync(dto.Email, hunterKey);
        if(!isEmailValid)
        {
            return BadRequest(new { message = "Такого Email не существует."});
        }
        if (_context.Users.Any(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email уже занят" });

        if (!string.IsNullOrEmpty(dto.AdminCode))
        {
            if (dto.AdminCode == ADMIN_CODE)
            {
                var admin = new User
                {
                    FullName = dto.FullName,
                    Email = dto.Email,
                    NameOfCompany = dto.NameOfCompany,
                    PasswordHash = HashPassword(dto.Password),
                    Role = UserRole.Admin
                };

                _context.Users.Add(admin);
                await _context.SaveChangesAsync();

                var adminToken = GenerateToken(admin.Id, admin.Email, admin.FullName, UserRole.Admin);

                return Ok(new { adminToken, admin.Id, admin.Email, admin.FullName, admin.NameOfCompany, role = "Admin" });
            }
            else
            {
                return BadRequest(new { message = "Неверный код доступа!" });
            }
        }

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            NameOfCompany = dto.NameOfCompany,
            PasswordHash = HashPassword(dto.Password),
            Role = UserRole.User
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateToken(user.Id, user.Email, user.FullName, UserRole.User);

        return Ok(new { token, user.Id, user.Email, user.FullName, user.NameOfCompany, role = "User" });
    }
    private static readonly HttpClient _httpClient = new();
    private async Task<bool> ValidEmailAsync(string Email, string ApiKey)
    {
        try
        {
            var url = $"https://api.hunter.io/v2/email-verifier?email={Uri.EscapeDataString(Email)}&api_key={ApiKey}";
            using var response = await _httpClient.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                return false;
            }

            using var jsonDoc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

            var root = jsonDoc.RootElement;

            if (root.TryGetProperty("data", out var dataElement) && dataElement.TryGetProperty("status", out var statusElement))
            {
                return statusElement.GetString() == "valid";
            }

            return false;
        }
        catch
        {
            return false;
        }
    }
    private string GenerateToken(int Id, string Email, string FullName, UserRole role)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, Id.ToString()),
            new Claim(ClaimTypes.Email, Email),
            new Claim("FullName", FullName),
            new Claim(ClaimTypes.Role, role.ToString())
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
