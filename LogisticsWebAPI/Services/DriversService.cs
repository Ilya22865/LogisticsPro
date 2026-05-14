using Microsoft.EntityFrameworkCore;
using LogisticsWebAPI.DTOs;
using LogisticsWebAPI.DTOs.Order;
using LogisticsWebAPI.Models;

namespace LogisticsWebAPI.Services;

public class DriversService : IDriversService
{
    private readonly UserContext _userContext;

    public DriversService(UserContext userContext)
    {
        _userContext = userContext;
    }

    public async Task<IEnumerable<DriversWithDetailsDto>> GetAllDriversAsync()
    {
        return await _userContext.Drivers
            .Include(d => d.Truck)
            .Select(d => new DriversWithDetailsDto
            {
                DriverId = d.Id,
                DriverFullName = d.FullName,
                DriverPhoneNumber = d.PhoneNumber,
                TruckModel = d.Truck != null ? d.Truck.ModelName : null,
                TruckRegisterNumber = d.Truck != null ? d.Truck.RegisterNumber : null,
                DriverStatus = d.Status,
                Route = d.Orders
                    .Where(o => o.RouteId != null)
                    .OrderByDescending(o => o.Id)
                    .Select(o => o.Route)
                    .Select(r => new RouteDto
                    {
                        StartLocation = r.StartLocation,
                        EndLocation = r.EndLocation,
                        DeliveryDate = r.DeliveryDate
                    })
                    .FirstOrDefault()
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<DriversWithDetailsDto>> GetDriversByStatus(DriverStatus driverStatus)
    {
        return await _userContext.Drivers
            .Where(d => d.Status == driverStatus)
            .Include(d => d.Truck)
            .Select(d => new DriversWithDetailsDto
            {
                DriverId = d.Id,
                DriverFullName = d.FullName,
                DriverPhoneNumber = d.PhoneNumber,
                TruckModel = d.Truck != null ? d.Truck.ModelName : null,
                TruckRegisterNumber = d.Truck != null ? d.Truck.RegisterNumber : null,
                DriverStatus = d.Status,
                Route = d.Orders
                    .Where(o => o.RouteId != null)
                    .OrderByDescending(o => o.Id)
                    .Select(o => o.Route)
                    .Select(r => new RouteDto
                    {
                        StartLocation = r.StartLocation,
                        EndLocation = r.EndLocation,
                        DeliveryDate = r.DeliveryDate
                    })
                    .FirstOrDefault()
            })
            .ToListAsync();
    }
}
