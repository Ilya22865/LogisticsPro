namespace LogisticsWebAPI.Models;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string NameOfCompany { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Role { get; set; } = "user";
    public int CompanyId { get; set; }
    public Company Company { get; set; } = null!;
}

public class Admin : User
{
    public string Code { get; set; } = null!;
}