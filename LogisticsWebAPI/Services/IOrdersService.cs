using LogisticsWebAPI.DTOs.Order;
namespace LogisticsWebAPI.Services;

public interface IOrdersService
{
    Task<IEnumerable<OrderWithDetailsDto>> GetOrdersListAsync(int? userId = null);
    Task<bool> UpdateOrderAsync(int orderId, string? status, double? price);
    Task<bool> CancelOrderAsync(int orderId, int userId);
    Task<bool> AssignRouteAsync(int orderId, int? driverId, string startLocation, string endLocation, string? stopPoints, DateTime deliveryDate);
}