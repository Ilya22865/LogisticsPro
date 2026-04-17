namespace LogisticsWebAPI.Models;

public enum CargoType
{
    General,
    Bulk,
    Liquid,
    Fragile,
    Danger,
    Perishable,
    Other
}
public class Cargo
{
    public int Id { get; set; }
    public double CargoWeight { get; set; }
    public string? Description { get; set; }
    public CargoType? CargoType { get; set; }
    public int? OrderId { get; set; } 
    public Order? Order { get; set; }
}
