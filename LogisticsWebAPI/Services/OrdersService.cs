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