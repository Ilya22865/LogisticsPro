namespace LogisticsWebAPI.Models;

public class Truck
{
    public int Id { get; set; }
    public string ModelName { get; set; } = null!;
    public string RegisterNumber { get; set; } = null!;
    public Driver? Driver { get; set; }
}
