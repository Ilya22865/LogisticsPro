namespace LogisticsWebAPI.Models;

public class Cargo
{
    public int Id { get; set; }
    public string CargoName { get; set; } = null!;
    public double CargoWeight { get; set; }
    public int? OrderId { get; set; } 
    public Order? Order { get; set; }
}
