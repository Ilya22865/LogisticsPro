using LogisticsWebAPI.Models;

namespace LogisticsWebAPI.Services;

public interface IGenerateTokenService
{
    public Task<string> GenerateUsersToken(int Id, string Email, string FullName, UserRole role);
    public Task<string> GenerateDriversToken(int Id, string Email, string FullName);
}