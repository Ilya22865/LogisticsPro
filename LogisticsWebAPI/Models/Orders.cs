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
    public int? CargoID { get; set; }
    public Cargo? Cargo { get; set; }
    public int? DriverID { get; set; }
    public Driver? Driver { get; set; }
}
