using LogisticsWebAPI.DTOs.Order;
namespace LogisticsWebAPI.Services;

public interface IOrdersService
{
    Task<IEnumerable<OrderWithDetailsDto>> GetOrdersListAsync(int? userId = null);
}