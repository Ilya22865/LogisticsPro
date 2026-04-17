using LogisticsWebAPI.Models;

namespace LogisticsWebAPI.DTOs.Order;

public class OrderWithDetailsDto
{
    public int OrderId { get; set; }
    public string? Route { get; set; }
    public List<CargoDto>? Cargos { get; set; }
    public OrderStatus OrderStatus { get; set; }
    public DateTime DeliveryDate { get; set; }
    public double Price { get; set; }
}