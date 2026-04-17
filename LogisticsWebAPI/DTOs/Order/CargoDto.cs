using LogisticsWebAPI.Models;

namespace LogisticsWebAPI.DTOs.Order;

public class CargoDto
{
    public string? Description { get; set; }
    public double CargoWeight { get; set; }
    public CargoType? CargoType { get; set; }
}