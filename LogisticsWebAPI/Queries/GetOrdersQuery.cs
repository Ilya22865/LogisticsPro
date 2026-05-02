using LogisticsWebAPI.Models;
using LogisticsWebAPI.DTOs.Order;
namespace LogisticsWebAPI.Queries;

public class GetOrdersQuery
{
    public OrderStatus? StatusFilter { get; set; }
    public int? OrderNumFilter { get; set; }
    public string? SearchTerm { get; set; }
    public double? PriceFilter { get; set; }
    public IQueryable<OrderWithDetailsDto> Execute(IQueryable<OrderWithDetailsDto> query)
    {
        if(!string.IsNullOrWhiteSpace(SearchTerm))
        {
            query = query.Where(o => o.OrderId.ToString().Contains(SearchTerm) ||
            o.Price.ToString().Contains(SearchTerm)); 
        }
        if(OrderNumFilter.HasValue)
        {
            query = query.Where(o => o.OrderId == OrderNumFilter.Value);
        }

        if (PriceFilter.HasValue)
        {
            query = query.Where(o => o.Price == PriceFilter.Value);
        }

        if(StatusFilter.HasValue)
        {
            query = query.Where(s => s.OrderStatus == StatusFilter);
        }
        return query;
    }
}