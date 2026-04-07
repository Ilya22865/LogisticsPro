namespace LogisticsWebAPI.Models;

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
    public int Age { get; set; }
    public DriverStatus Status { get; set; }
    public string PhoneNumber { get; set; } = null!;
    public int? TruckID { get; set; }
    public Truck? Truck { get; set; }
}
