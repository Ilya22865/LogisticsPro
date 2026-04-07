namespace LogisticsWebAPI.Models;

public class Route
{
    public int Id { get; set; }
    public string StartLocation { get; set; } = null!;
    public string EndLocation { get; set; } = null!;
    public string? StopPoint { get; set; }
    public DateTime DeliveryDate { get; set; }
    public int OrderID { get; set; }
    public Order? Order { get; set; }
    public TimeSpan? EstimatedTime { get; set; }
    public TimeSpan? ActualTime { get; set; }
}
