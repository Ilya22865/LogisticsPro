using LogisticsWebAPI.DTOs.Order;

namespace LogisticsWebAPI.DTOs;

public class DashboardDto
{
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public int ActiveOrders { get; set; }
    public int DeliveredOrders { get; set; }
    public int CancelledOrders { get; set; }
    public int TotalDrivers { get; set; }
    public int FreeDrivers { get; set; }
    public int TotalClients { get; set; }
    public double Revenue { get; set; }
    public List<OrderWithDetailsDto> RecentOrders { get; set; } = new();
}
