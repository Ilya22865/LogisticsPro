using LogisticsWebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using LogisticsWebAPI.DTOs.Auth;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using LogisticsWebAPI.Services;
namespace LogisticsWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly IGenerateTokenService _generateTokenService;

    public AuthController(UserContext context, IConfiguration configuration, IEmailService emailService, IGenerateTokenService generateTokenService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
        _generateTokenService = generateTokenService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = _context.Users.FirstOrDefault(u => u.Email == dto.Email);
        if (user == null)
            return Unauthorized(new { message = "Неверный Email или пароль!" });

        if (!VerifyPassword(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Неверный Email или пароль!" });

        var token = _generateTokenService.GenerateUsersToken(user.Id, user.Email, user.FullName, user.Role);
        return Ok(new { token, user.Id, user.Email, user.FullName, user.NameOfCompany, role = user.Role.ToString() });
    }


    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var config = _configuration.GetSection("Hunter");
        var AdminCodeConf = _configuration.GetSection("AdminCode");
        var ADMIN_CODE = AdminCodeConf["Code"];
        string hunterKey = config["ApiKey"]!;
        bool isEmailValid;

        isEmailValid = await _emailService.ValidationEmailAsync(dto.Email, hunterKey);
        if (!isEmailValid)
        {
            return BadRequest(new { message = "Такого Email не существует." });
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

                var adminToken = _generateTokenService.GenerateUsersToken(admin.Id, admin.Email, admin.FullName, UserRole.Admin);

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

        var token = _generateTokenService.GenerateUsersToken(user.Id, user.Email, user.FullName, UserRole.User);

        return Ok(new { token, user.Id, user.Email, user.FullName, user.NameOfCompany, role = "User" });
    }

    private string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    private bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    [HttpGet("external-login")]
    public IActionResult ExternalLogin([FromQuery] string provider)
    {
        var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Auth");
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl! };
        properties.Items["LoginProvider"] = provider;
        return Challenge(properties, provider);
    }

    [HttpGet("google-callback")]
    public async Task<IActionResult> ExternalLoginCallback()
    {
        var result = await HttpContext.AuthenticateAsync("ExternalCookie");
        if (result?.Principal == null)
            return BadRequest(new { message = "Google authentication failed" });

        var email = result.Principal.FindFirst(ClaimTypes.Email)?.Value
                 ?? result.Principal.FindFirst("email")?.Value;
        var name = result.Principal.FindFirst(ClaimTypes.Name)?.Value
                ?? result.Principal.FindFirst("name")?.Value;

        if (string.IsNullOrEmpty(email))
            return BadRequest(new { message = "Google did not return an email" });

        var user = _context.Users.FirstOrDefault(u => u.Email == email);

        if (user == null)
        {
            user = new User
            {
                FullName = name ?? email,
                Email = email,
                NameOfCompany = "",
                PasswordHash = HashPassword(Guid.NewGuid().ToString()),
                Role = UserRole.User
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        var token = _generateTokenService.GenerateUsersToken(user.Id, user.Email, user.FullName, user.Role);

        return Redirect($"http://localhost:5000/pages/index.html?token={Uri.EscapeDataString(token.ToString()!)}&user_id={user.Id}&email={Uri.EscapeDataString(email)}&name={Uri.EscapeDataString(user.FullName)}&role={Uri.EscapeDataString(user.Role.ToString())}");
    }
}
