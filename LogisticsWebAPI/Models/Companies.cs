namespace LogisticsWebAPI.Models;

public class Company
{
    public int CompanyId { get; set; }
    public string Name { get; set; } = null!;

    public List<User> Users { get; set; } = new List<User>();
}