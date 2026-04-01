using LogisticsWebAPI.Models;

namespace LogisticsWebAPI.DTOs.Auth;

public class RegisterDto
{
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string NameOfCompany { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string? AdminCode { get; set; }
}