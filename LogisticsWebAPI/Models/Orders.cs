namespace LogisticsWebAPI.Models;

public enum OrderStatus
{
    Pending,
    InTransit,
    Delivered,
    Cancelled
}

public enum OrderPriority
{
    Low,
    Normal,
    High,
    Urgent
}

public class Order
{
    public int Id { get; set; }
    public string Route { get; set; } = null!;
    public string CargoName { get; set; } = null!;
    public double CargoWeight { get; set; }
    public DateTime CreateDate { get; set; }
    public DateTime DeliveryDate { get; set; }
    public string Status { get; set; } = null!;

}