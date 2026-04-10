using LogisticsWebAPI.DTOs;
using LogisticsWebAPI.Models;

namespace LogisticsWebAPI.Services;

public interface IDriversService
{
    Task<IEnumerable<DriversWithDetailsDto>> GetAllDriversAsync();
    Task<IEnumerable<Driver>> GetDriversByStatus(DriverStatus driverStatus);

}