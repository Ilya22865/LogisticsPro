using LogisticsWebAPI.Models;

namespace LogisticsWebAPI.DTOs;

public class DriverDto
{
    public string FullName { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string Email { get; set; } = null!;
    public DriverStatus Status { get; set; }

    public TruckDto? Truck { get; set; }
}

