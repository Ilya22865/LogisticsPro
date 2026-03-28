using System.Security.Permissions;

namespace LogisticsWebAPI.Models;

class Route
{
    public int Id { get; set; }
    public string StartLocation { get; set; } = null!;
    public string EndLocation { get; set; } = null!;
    public string? StopPoint { get; set; }
    public DateTime DeliveryDate { get; set; }
    public int OrderId { get; set; }
    public int DriverId { get; set;}
    public DateTime EstimatedTime { get; set; }
    public TimeOnly ActualTime { get; set; }
}