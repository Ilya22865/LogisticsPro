using LogisticsWebAPI.DTOs.Auth;
namespace LogisticsWebAPI.Services;

public interface IUsersService {
    Task<IEnumerable<UserWithDetailsDto>> GetUsersAsync();
    
}