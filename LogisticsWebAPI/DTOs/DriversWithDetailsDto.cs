using LogisticsWebAPI.Models;

namespace LogisticsWebAPI.DTOs;

public class DriversWithDetailsDto
{
    public string DriverFullName { get; set; } = null!;
    public string DriverPhoneNumber { get; set; } = null!;
    public string TruckRegisterNumber { get; set; } = null!;
    public string TruckModel { get; set; } = null!;
    public DriverStatus DriverStatus { get; set; }
    public string? RouteStart { get; set; }
    public string? RouteEnd { get; set; }
}