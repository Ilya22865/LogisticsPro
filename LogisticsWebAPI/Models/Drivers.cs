namespace LogisticsWebAPI.Models;
// Тест комменты
public enum DriverStatus
{
    Active,
    Inactive,
    On_leave
}
public class Driver
{
    public int Id { get; set; }
    public string FullName { get; set; } = null!;
    public DriverStatus Status { get; set; }
    public string PhoneNumber { get; set; } = null!;
    public string Email { get; set; } = null!;
    public int? TruckId { get; set; }
    public Truck? Truck { get; set; }
    public List<Order> Orders { get; set; } = new List<Order>();
}
