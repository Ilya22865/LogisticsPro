namespace LogisticsWebAPI.DTOs.Order;

public class AssignRouteDto
{
    public int OrderId { get; set; }
    public int? DriverId { get; set; }
    public string StartLocation { get; set; } = null!;
    public string EndLocation { get; set; } = null!;
    public string? StopPoints { get; set; }
    public DateTime DeliveryDate { get; set; }
}
