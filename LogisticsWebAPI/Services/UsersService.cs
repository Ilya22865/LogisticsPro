using LogisticsWebAPI.Models;
using LogisticsWebAPI.DTOs.Auth;
using Microsoft.EntityFrameworkCore;
namespace LogisticsWebAPI.Services;
public class UsersService : IUsersService {
    private readonly UserContext _userContext;
   
    public UsersService(UserContext userContext) {
        _userContext = userContext;
    }

    public async Task<IEnumerable<UserWithDetailsDto>> GetUsersAsync() {
        var users = await _userContext.Users
            .Where(u => u.Role == UserRole.User)
           .Select(u => new UserWithDetailsDto {
               NameOfCompany = u.NameOfCompany,
               FullName = u.FullName,
               Email = u.Email,
               AmountOfOrders = u.Orders.Count(),
           })
           .ToListAsync();

        return users;
    }
}
