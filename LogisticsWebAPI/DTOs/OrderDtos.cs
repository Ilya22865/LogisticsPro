namespace LogisticsWebAPI.DTOs;

public class CreateOrderDto
{
    public int ClientId { get; set; }
    public string ClientName { get; set; } = null!;
    
    public string Priority { get; set; } = "Normal";
    
    public string StartLocation { get; set; } = null!;
    public string EndLocation { get; set; } = null!;
    
    public string CargoDescription { get; set; } = null!;
    public decimal Weight { get; set; }
    public decimal Volume { get; set; }
    
    public DateTime? PickupDate { get; set; }
    public DateTime? DeliveryDate { get; set; }
    
    public string? Notes { get; set; }
}

public class UpdateOrderDto
{
    public string? StartLocation { get; set; }
    public string? EndLocation { get; set; }
    public string? CargoDescription { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Volume { get; set; }
    public string? Priority { get; set; }
    public string? Status { get; set; }
    public DateTime? PickupDate { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public int? DriverId { get; set; }
    public string? Notes { get; set; }
}

public class OrderDto
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = null!;
    public string Status { get; set; } = null!;
    public string Priority { get; set; } = null!;
    public string StartLocation { get; set; } = null!;
    public string EndLocation { get; set; } = null!;
    public string CargoDescription { get; set; } = null!;
    public decimal Weight { get; set; }
    public decimal Volume { get; set; }
    public decimal Cost { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? PickupDate { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public int? DriverId { get; set; }
    public string? DriverName { get; set; }
    public int? RouteId { get; set; }
    public string? Notes { get; set; }
}

public class OrderFilterDto
{
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public string? SearchQuery { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}
