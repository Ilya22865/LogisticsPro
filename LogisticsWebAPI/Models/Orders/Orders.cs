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
    public string Route { get; set; } = null!;
    public string CargoName { get; set; } = null!;
    public double CargoWeight { get; set; }
    public DateTime CreateDate { get; set; }
    public DateTime DeliveryDate { get; set; }
    public OrderStatus Status { get; set; } 

}