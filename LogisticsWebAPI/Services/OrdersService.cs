using Microsoft.EntityFrameworkCore;
using LogisticsWebAPI.DTOs.Order;
using LogisticsWebAPI.Models;

namespace LogisticsWebAPI.Services;

public class OrdersService : IOrdersService
{
    private readonly UserContext _context;

    public OrdersService(UserContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<OrderWithDetailsDto>> GetOrdersListAsync()
    {
        var orders = await _context.Orders
            .Include(o => o.Route)
            .Include(o => o.Cargos)
            .ToListAsync();

        return orders.Select(o => new OrderWithDetailsDto
        {
            OrderId = o.Id,
            OrderStatus = o.Status,
            DeliveryDate = o.DeliveryDate,
            Price = o.Price,
            Route = o.Route != null ? new RouteDto
            {
                StartLocation = o.Route.StartLocation,
                EndLocation = o.Route.EndLocation,
                DeliveryDate = o.Route.DeliveryDate
            } : null,
            Cargos = o.Cargos.Select(c => new CargoDto
            {
                CargoWeight = c.CargoWeight,
                Description = c.Description,
                CargoType = c.CargoType
            }).ToList()
        });
    }
}