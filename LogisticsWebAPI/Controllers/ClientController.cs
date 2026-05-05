using LogisticsWebAPI.DTOs;
using LogisticsWebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using LogisticsWebAPI.Services;
using LogisticsWebAPI.Queries;
using Microsoft.EntityFrameworkCore;

namespace LogisticsWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientController : ControllerBase
{
    private readonly UserContext _context;
    private readonly IUsersService _userService;

    public ClientController(UserContext context, IUsersService userService)
    {
        _context = context;
        _userService = userService;
    }

    [HttpGet("getUsers")]
    public async Task<ActionResult> GetClients()
    {
        var clients = await _userService.GetUsersAsync();
        return Ok(clients);
    }
}
