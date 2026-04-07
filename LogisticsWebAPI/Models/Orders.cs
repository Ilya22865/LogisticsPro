namespace LogisticsWebAPI.Models;

public enum OrderStatus
{
    Pending,
    InTransit,
    Delivered,
    Cancelled
}

public class Order
{
    public int Id { get; set; }
    public DateTime DeliveryDate { get; set; }
    public OrderStatus Status { get; set; }
    public int? UserID { get; set; }
    public User? User { get; set; }
    public List<Cargo> Cargos { get; set; } = new List<Cargo>();
    public int? DriverID { get; set; }
    public Driver? Driver { get; set; } 
    public int? RouteId { get; set; }
    public Route? Route { get; set; }
}
