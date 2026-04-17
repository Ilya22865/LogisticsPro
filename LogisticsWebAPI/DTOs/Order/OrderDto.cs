using LogisticsWebAPI.Models;

namespace LogisticsWebAPI.DTOs.Order;

public class OrderDto
{
    public RouteDto? Route { get; set; }
    public List<CargoDto>? Cargos { get; set; }
    public string? AddtitionalInfo { get; set; }
    
}