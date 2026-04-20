using LogisticsWebAPI.DTOs;
using LogisticsWebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using LogisticsWebAPI.Services;
using LogisticsWebAPI.Queries;
using Microsoft.EntityFrameworkCore;

namespace LogisticsWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DriverController : ControllerBase
{
    private readonly UserContext _userContext;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly IDriversService _driversService;
    private readonly IGenerateTokenService _generateTokenService;

     public DriverController(UserContext userContext, 
        IConfiguration configuration, 
        IEmailService emailService, 
        IGenerateTokenService generateTokenService,
        IDriversService driversService)
    {
        _userContext = userContext;
        _configuration = configuration;
        _emailService = emailService;
        _generateTokenService = generateTokenService;
        _driversService = driversService;
    }

    [HttpPost("addDriver")]
    public async Task<IActionResult> AddDriver([FromBody] DriverDto dto)
    {
        var config = _configuration.GetSection("Hunter");
        string hunterKey = config["ApiKey"]!;
        bool isEmailValid;

        isEmailValid = await _emailService.ValidationEmailAsync(dto.Email, hunterKey);
        if (!isEmailValid)
        {
            return BadRequest(new { message = "Такого Email не существует." });
        }

        if (_userContext.Drivers.Any(d => d.Email == dto.Email))
            return BadRequest(new { message = "Email уже занят. Проверьте базу данных, возможно этот водитель уже зарегестрирован" });

        var driver = new Driver
        {
            FullName = dto.FullName,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,
            Status = dto.Status,
            Truck = dto.Truck != null ? new Truck
            {
                ModelName = dto.Truck.ModelName,
                RegisterNumber = dto.Truck.RegisterNumber
            } : null
        };

        _userContext.Drivers.Add(driver);
        await _userContext.SaveChangesAsync();

        var token = await _generateTokenService.GenerateDriversToken(driver.Id, driver.Email, driver.FullName);

        return Ok(new { token, driver.Id, driver.Email, driver.FullName, driver.PhoneNumber, driver.Status });
    }

    [HttpGet("getDriversList")]
    public async Task<IActionResult> GetAllDriversAsync()
    {
        var allDrivers = await _driversService.GetAllDriversAsync();
        return Ok(allDrivers);
    }

    [HttpGet("getDriversBySearch")]
    public async Task<IActionResult> GetDriversBySearchAsync([FromQuery] GetDriversQuery query)
    {
        var dtoQuery = _userContext.Drivers
            .Include(d => d.Truck)
            .Select(d => new DriversWithDetailsDto
            {
                DriverId = d.Id,
                DriverFullName = d.FullName,
                DriverPhoneNumber = d.PhoneNumber,
                TruckModel = d.Truck != null ? d.Truck.ModelName : null,
                TruckRegisterNumber = d.Truck != null ? d.Truck.RegisterNumber : null,
                DriverStatus = d.Status
            });
        
        var filteredDtoQuery = query.Execute(dtoQuery);
        var result = await filteredDtoQuery.ToListAsync();
        
        return Ok(result);
    }
    

}
