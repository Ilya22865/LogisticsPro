using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using LogisticsWebAPI.DTOs.Order;
using LogisticsWebAPI.DTOs;
using LogisticsWebAPI.Models;
using LogisticsWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LogisticsWebAPI.Queries;

namespace LogisticsWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly UserContext _userContext;
    private readonly IConfiguration _configuration;
    private readonly IOrdersService _ordersService;


    public OrderController(UserContext userContext, IConfiguration configuration, IOrdersService ordersService)
    {
        _userContext = userContext;
        _configuration = configuration;
        _ordersService = ordersService;
    }
    [Authorize]
    [HttpPost("addOrder")]
    public async Task<IActionResult> AddOrder([FromBody] OrderDto dto)
    {
        var userClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userClaim == null)
        {
            return Unauthorized();
        }

        var userId = int.Parse(userClaim.Value);

        var order = new Order
        {
            Cargos = dto.Cargos != null
                ? dto.Cargos.Select(c => new Cargo
                {
                    CargoWeight = c.CargoWeight,
                    CargoType = c.CargoType,
                    Description = c.Description
                }).ToList()
                : new List<Cargo>(),

            Route = dto.Route != null ? new Models.Route
            {
                StartLocation = dto.Route.StartLocation,
                EndLocation = dto.Route.EndLocation,
                DeliveryDate = dto.Route.DeliveryDate
            } : null,

            AddtitionalInfo = dto.AddtitionalInfo,
            Status = OrderStatus.Pending
        };

        order.UserID = userId;
        _userContext.Orders.Add(order);
        await _userContext.SaveChangesAsync();

        return Ok(new { id = order.Id });
    }

    [Authorize]
    [HttpGet("getOrdersListForAdmin")]
    public async Task<IActionResult> GetOrdersAsync()
    {
        var allOrders = await _ordersService.GetOrdersListAsync();
        return Ok(allOrders);
    }

    [Authorize]
    [HttpGet("getOrdersListForUser")]
    public async Task<IActionResult> GetOrdersByIdAsync()
    {
        var userClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userClaim == null)
        {
            return Unauthorized();
        }

        var userId = int.Parse(userClaim.Value);
        var orders = await _ordersService.GetOrdersListAsync(userId);
        return Ok(orders);
    }

    [HttpGet("getOrderBySearch")]
    public async Task<IActionResult> GetOrderBySearchAsync([FromQuery] GetOrdersQuery search)
    {
        var orders = _userContext.Orders
        .Include(o => o.Cargos)
        .Select(o => new OrderWithDetailsDto
        {
            OrderId = o.Id,
            Route = o.Route != null ? new RouteDto
            {
                StartLocation = o.Route.StartLocation,
                EndLocation = o.Route.EndLocation,
                DeliveryDate = o.Route.DeliveryDate,
            } : null,
            Price = o.Price,
            OrderStatus = o.Status,
            Driver = o.Driver != null ? new DriverDto
            {
                FullName = o.Driver.FullName,
                PhoneNumber = o.Driver.PhoneNumber,
                Email = o.Driver.Email,
                Status = o.Driver.Status,
            } : null,
            User = o.User != null ? new DTOs.Auth.RegisterDto
            {
                FullName = o.User.FullName,
                Email = o.User.Email,
            } : null,
            Cargos = o.Cargos != null ? o.Cargos.Select(c => new CargoDto
            {
                CargoType = c.CargoType,
                Description = c.Description,
                CargoWeight = c.CargoWeight,
            }).ToList() : null,
        });
        var filteredOrders = search.Execute(orders);
        var result = await filteredOrders.ToListAsync();
        return Ok(result);
    }
}
