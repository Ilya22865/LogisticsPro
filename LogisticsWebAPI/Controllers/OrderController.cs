using System.Security.Claims;
using LogisticsWebAPI.DTOs.Order;
using LogisticsWebAPI.Models;
using LogisticsWebAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LogisticsWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly UserContext _userContext;
    private readonly IConfiguration _configuration;
    private readonly IOrdersService _ordersService;


    public OrderController(UserContext userContext, IConfiguration configuration)
    {
        _userContext = userContext;
        _configuration = configuration;
    }
    [Authorize]
    [HttpPost("addOrder")]
    public async Task<IActionResult> AddOrder([FromBody] OrderDto dto)
    {
        var userClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if(userClaim == null)
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

    // [Authorize]
    // [HttpGet("getOrdersListForUser")]

}
