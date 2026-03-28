namespace LogisticsWebAPI.Models;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string NameOfCompany { get; set; } = null!;
}

public class Admin : User
{
    public string Code { get; set; } = null!;
}