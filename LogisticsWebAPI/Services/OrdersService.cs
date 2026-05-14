using Microsoft.EntityFrameworkCore;
using LogisticsWebAPI.DTOs.Order;
using LogisticsWebAPI.DTOs.Auth;
using LogisticsWebAPI.Models;
using LogisticsWebAPI.DTOs;
namespace LogisticsWebAPI.Services;

public class OrdersService : IOrdersService
{
    private readonly UserContext _context;

    public OrdersService(UserContext context)
    {
        _context = context;
    }

    public async Task<bool> UpdateOrderAsync(int orderId, string? status, double? price)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null) return false;

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<OrderStatus>(status, out var newStatus))
        {
            order.Status = newStatus;
        }

        if (price.HasValue)
        {
            order.Price = price.Value;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CancelOrderAsync(int orderId, int userId)
    {
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == orderId && o.UserID == userId);
        if (order == null) return false;

        if (order.Status != OrderStatus.Pending && order.Status != OrderStatus.InTransit)
            return false;

        order.Status = OrderStatus.Cancelled;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AssignRouteAsync(int orderId, int? driverId, string startLocation, string endLocation, string? stopPoints, DateTime deliveryDate)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null) return false;

        var route = new Models.Route
        {
            StartLocation = startLocation,
            EndLocation = endLocation,
            StopPoint = stopPoints,
            DeliveryDate = deliveryDate
        };

        _context.Routes.Add(route);
        await _context.SaveChangesAsync();

        order.RouteId = route.Id;
        order.DriverID = driverId;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<OrderWithDetailsDto>> GetOrdersListAsync(int? userId = null)
    {
        var query = _context.Orders.AsQueryable();
    
        if (userId.HasValue)
        {
            query = query.Where(o => o.UserID == userId.Value);
        }
    
        return await query
            .Select(o => new OrderWithDetailsDto
            {
                User = o.User != null ? new RegisterDto
                {
                    FullName = o.User.FullName,
                    Email = o.User.Email,
                } : null,
                OrderId = o.Id,
                OrderStatus = o.Status,
                Price = o.Price,
                Driver = o.Driver != null ? new DriverDto
                {
                    FullName = o.Driver.FullName,
                    PhoneNumber = o.Driver.PhoneNumber,
                    Email = o.Driver.Email,
                    Status = o.Driver.Status,
                } : null,
                Route = o.Route != null ? new RouteDto
                {
                    StartLocation = o.Route.StartLocation,
                    EndLocation = o.Route.EndLocation,
                    DeliveryDate = o.Route.DeliveryDate
                } : null,
                Cargos = o.Cargos != null
                    ? o.Cargos.Select(c => new CargoDto
                    {
                        CargoWeight = c.CargoWeight,
                        Description = c.Description,
                        CargoType = c.CargoType
                    }).ToList()
                    : new List<CargoDto>()
            })
            .ToListAsync();
    }
}