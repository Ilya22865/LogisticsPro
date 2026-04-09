using LogisticsWebAPI.DTOs;
using LogisticsWebAPI.Models;
using Microsoft.AspNetCore.Mvc;
using LogisticsWebAPI.Services;
namespace LogisticsWebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DriverController : ControllerBase
{
    private readonly DriverContext _driverContext;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly IGenerateTokenService _generateTokenService;

    public DriverController(DriverContext driverContext, IConfiguration configuration, IEmailService emailService, IGenerateTokenService generateTokenService)
    {
        _driverContext = driverContext;
        _configuration = configuration;
        _emailService = emailService;
        _generateTokenService = generateTokenService;
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

        if (_driverContext.Drivers.Any(d => d.Email == dto.Email))
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

        _driverContext.Drivers.Add(driver);
        await _driverContext.SaveChangesAsync();

        var token = _generateTokenService.GenerateDriversToken(driver.Id, driver.Email, driver.FullName);

        return Ok(new { token, driver.Id, driver.Email, driver.FullName, driver.PhoneNumber, driver.Status });
    }

    // private async Task<bool> ValidPhoneNumber(string phoneNumber)
    // {
    //     try
    //     {
    //         var url = $"http://num.voxlink.ru/get/?num={phoneNumber}";
    //         using var response = await 
    //     }
    // }

}
