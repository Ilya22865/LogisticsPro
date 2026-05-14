namespace LogisticsWebAPI.DTOs.Order;

public class UpdateOrderDto
{
    public int OrderId { get; set; }
    public string? Status { get; set; }
    public double? Price { get; set; }
}
