namespace LogisticsWebAPI.Models;

public enum UserRole
{
    User,
    Admin
}
public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string NameOfCompany { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public UserRole Role { get; set; }
    public int? CompanyId { get; set; }
    public User? CompanyUser { get; set; }
}