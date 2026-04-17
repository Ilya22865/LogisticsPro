namespace LogisticsWebAPI.DTOs.Order;

public class RouteDto
{
    public string StartLocation { get; set; } = null!;
    public string EndLocation { get; set; } = null!;
    public DateTime DeliveryDate { get; set; }
}