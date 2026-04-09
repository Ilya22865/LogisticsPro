using LogisticsWebAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace LogisticsWebAPI.Services;

public class GenerateTokenService : IGenerateTokenService
{
    private readonly IConfiguration _configuration;
    public GenerateTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<string> GenerateUsersToken(int Id, string Email, string FullName, UserRole role)
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

    public async Task<string> GenerateDriversToken(int Id, string Email, string FullName)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, Id.ToString()),
            new Claim(ClaimTypes.Email, Email),
            new Claim("FullName", FullName),
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
}