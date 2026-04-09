namespace LogisticsWebAPI.Services;

public interface IEmailService
{
    Task<bool> ValidationEmailAsync(string Email, string ApiKey);
}