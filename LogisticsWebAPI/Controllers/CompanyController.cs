using Microsoft.AspNetCore.Mvc;
using LogisticsWebAPI.Models;
using LogisticsWebAPI.DTOs.Auth;
using LogisticsWebAPI.DTOs;
namespace LogisticsWebAPI.Controllers;

[ApiController]
[Route ("api/{controller}")]
public class CompanyController : ControllerBase {
    private readonly UserContext _context;
    private readonly IConfiguration _configuration;

    public CompanyController(UserContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("find-or-create")]
    public async Task<IActionResult> FindOrCreate([FromBody] CompanyDto dto)
    {
        var company = _context.Companies.FirstOrDefault(c => c.Name == dto.NameOfCompany);

        if(company == null)
        {
            company = new Company { Name = dto.NameOfCompany };
        }

        _context.Companies.Add(company);
        await _context.SaveChangesAsync();

        return Ok(new { company.CompanyId, company.Name });
    }
}