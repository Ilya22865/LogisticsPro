using LogisticsWebAPI.DTOs.Order;
using LogisticsWebAPI.Models;

namespace LogisticsWebAPI.DTOs;

public class DriversWithDetailsDto
{
    public int DriverId { get; set; } 
    public string DriverFullName { get; set; } = null!;
    public string DriverPhoneNumber { get; set; } = null!;
    public string TruckRegisterNumber { get; set; } = null!;
    public string TruckModel { get; set; } = null!;
    public DriverStatus DriverStatus { get; set; }
    public RouteDto? Route { get; set; }

}