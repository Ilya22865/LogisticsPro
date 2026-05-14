using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LogisticsWebAPI.DTOs;
using LogisticsWebAPI.DTOs.Auth;
using LogisticsWebAPI.DTOs.Order;
using LogisticsWebAPI.Models;

namespace LogisticsWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly UserContext _context;

    public DashboardController(UserContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> GetStats()
    {
        var totalOrders = await _context.Orders.CountAsync();
        var pendingOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Pending);
        var activeOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.InTransit);
        var deliveredOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Delivered);
        var cancelledOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Cancelled);
        var totalDrivers = await _context.Drivers.CountAsync();
        var freeDrivers = await _context.Drivers.CountAsync(d => d.Status == DriverStatus.Inactive);
        var totalClients = await _context.Users.CountAsync(u => u.Role == UserRole.User);
        var revenue = await _context.Orders.Where(o => o.Status == OrderStatus.Delivered).SumAsync(o => o.Price);

        var recentOrders = await _context.Orders
            .OrderByDescending(o => o.Id)
            .Take(5)
            .Select(o => new OrderWithDetailsDto
            {
                OrderId = o.Id,
                OrderStatus = o.Status,
                Price = o.Price,
                User = o.User != null ? new RegisterDto
                {
                    FullName = o.User.FullName,
                    Email = o.User.Email,
                } : null,
                Route = o.Route != null ? new RouteDto
                {
                    StartLocation = o.Route.StartLocation,
                    EndLocation = o.Route.EndLocation,
                    DeliveryDate = o.Route.DeliveryDate
                } : null,
                Driver = o.Driver != null ? new DriverDto
                {
                    FullName = o.Driver.FullName,
                    PhoneNumber = o.Driver.PhoneNumber,
                    Email = o.Driver.Email,
                    Status = o.Driver.Status,
                } : null,
            })
            .ToListAsync();

        return Ok(new DashboardDto
        {
            TotalOrders = totalOrders,
            PendingOrders = pendingOrders,
            ActiveOrders = activeOrders,
            DeliveredOrders = deliveredOrders,
            CancelledOrders = cancelledOrders,
            TotalDrivers = totalDrivers,
            FreeDrivers = freeDrivers,
            TotalClients = totalClients,
            Revenue = revenue,
            RecentOrders = recentOrders,
        });
    }
}
