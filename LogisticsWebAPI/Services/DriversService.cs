using Microsoft.EntityFrameworkCore;
using LogisticsWebAPI.DTOs;
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
        var result = await _userContext.Drivers
            .GroupJoin(_userContext.Orders,
                driver => driver.Id,
                order => order.DriverID,
                (driver, orders) => new { driver, orders })
            .SelectMany(
                x => x.orders.DefaultIfEmpty(),
                (x, order) => new { x.driver, order })
            .GroupJoin(_userContext.Trucks,
                x => x.driver.TruckId,
                truck => truck.Id,
                (x, trucks) => new { x.driver, x.order, trucks })
            .SelectMany(
                x => x.trucks.DefaultIfEmpty(),
                (x, truck) => new { x.driver, x.order, truck })
            .GroupJoin(_userContext.Routes,
                x => x.order != null ? x.order.RouteId : (int?)null,
                route => route.Id,
                (x, routes) => new { x.driver, x.order, x.truck, routes })
            .SelectMany(
                x => x.routes.DefaultIfEmpty(),
                (x, route) => new DriversWithDetailsDto
                {
                    DriverFullName = x.driver.FullName,
                    DriverPhoneNumber = x.driver.PhoneNumber,
                    TruckModel = x.truck!.ModelName,
                    TruckRegisterNumber = x.truck.RegisterNumber,
                    DriverStatus = x.driver.Status,
                    Route = route != null ? new DTOs.Order.RouteDto
                    {
                        StartLocation = route.StartLocation,
                        EndLocation = route.EndLocation,
                        DeliveryDate = route.DeliveryDate
                    } : null
                })
            .ToListAsync();

        return result;
    }

    public async Task<IEnumerable<DriversWithDetailsDto>> GetDriversByStatus(DriverStatus driverStatus)
    {
        var drivers = await _userContext.Drivers
            .GroupJoin(_userContext.Orders,
                driver => driver.Id,
                order => order.DriverID,
                (driver, orders) => new { driver, orders })
            .SelectMany(
                x => x.orders.DefaultIfEmpty(),
                (x, order) => new { x.driver, order })
            .GroupJoin(_userContext.Trucks,
                x => x.driver.TruckId,
                truck => truck.Id,
                (x, trucks) => new { x.driver, x.order, trucks })
            .SelectMany(
                x => x.trucks.DefaultIfEmpty(),
                (x, truck) => new { x.driver, x.order, truck })
            .GroupJoin(_userContext.Routes,
                x => x.order != null ? x.order.RouteId : (int?)null,
                route => route.Id,
                (x, routes) => new { x.driver, x.order, x.truck, routes })
            .SelectMany(
                x => x.routes.DefaultIfEmpty(),
                (x, route) => new DriversWithDetailsDto
                {
                    DriverFullName = x.driver.FullName,
                    DriverPhoneNumber = x.driver.PhoneNumber,
                    TruckModel = x.truck!.ModelName,
                    TruckRegisterNumber = x.truck.RegisterNumber,
                    DriverStatus = x.driver.Status,
                    Route = route != null ? new DTOs.Order.RouteDto
                    {
                        StartLocation = route.StartLocation,
                        EndLocation = route.EndLocation,
                        DeliveryDate = route.DeliveryDate
                    } : null
                }).Where(s => s.DriverStatus == driverStatus).ToListAsync();
            return drivers;
    }
}