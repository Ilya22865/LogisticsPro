namespace LogisticsWebAPI.Models;

public class Company
{
    public int CompanyId { get; set; }
    public string Name { get; set; }

    public List<User> Users { get; set; } = new List<User>();
}