namespace LogisticsWebAPI.DTOs.Auth;

public class UserWithDetailsDto {
    public string FullName { get; set; }
    public string NameOfCompany { get; set; }
    public string Email { get; set; }
    public int AmountOfOrders { get; set; }
}