using LogisticsWebAPI.DTOs;
using LogisticsWebAPI.Models;
namespace LogisticsWebAPI.Queries;

public class GetDriversQuery
{
    public string? FullNameFilter { get; set; }
    public string? PhoneNumberFilter { get; set; }
    public string? RegisterNumberFilter { get; set; }
    public DriverStatus? StatusFilter { get; set; }
    public string? SearchTerm { get; set; }

    public IQueryable<DriversWithDetailsDto> Execute(IQueryable<DriversWithDetailsDto> query)
    {
        if(!string.IsNullOrEmpty(SearchTerm))
        {
            query = query.Where(d => d.DriverFullName.Contains(SearchTerm) || 
            d.DriverPhoneNumber.Contains(SearchTerm) || 
            d.TruckRegisterNumber.Contains(SearchTerm));
        }
        if(!string.IsNullOrEmpty(FullNameFilter))
        {
            query = query.Where(fn => fn.DriverFullName.Contains(FullNameFilter));
        }

        if(!string.IsNullOrEmpty(PhoneNumberFilter))
        {
            query = query.Where(pn => pn.DriverPhoneNumber.Contains(PhoneNumberFilter));
        }
        
        if(!string.IsNullOrEmpty(RegisterNumberFilter))
        {
            query = query.Where(rn => rn.TruckRegisterNumber.Contains(RegisterNumberFilter));
        }

        if(StatusFilter.HasValue)
        {
            query = query.Where(d => d.DriverStatus == StatusFilter.Value);
        }
        return query;
    }
}