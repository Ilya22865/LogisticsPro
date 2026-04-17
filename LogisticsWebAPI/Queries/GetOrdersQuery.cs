using LogisticsWebAPI.Models;
using LogisticsWebAPI.DTOs.Order;
namespace LogisticsWebAPI.Queries;

public class GetOrdersQuery
{
    public int UserId { get; set; }
    public OrderStatus? OrderStatusFilter { get; set; }
    public int OrderNumFilter { get; set; }
    public string? SearchTerm { get; set; }
    public double PriceFilter { get; set; }

    public IQueryable<OrderWithDetailsDto> Execute(IQueryable<OrderWithDetailsDto> query)
    {
        if(!string.IsNullOrEmpty(SearchTerm))
        {
            query = query.Where(o => o.OrderId.ToString().Contains(SearchTerm) ||
            o.Price.ToString().Contains(SearchTerm));
        }

        if(!string.IsNullOrEmpty(OrderNumFilter.ToString()))
        {
            query = query.Where(on => on.OrderId.ToString().Contains(OrderNumFilter.ToString()));
        }

        if(!string.IsNullOrEmpty(PriceFilter.ToString()))
        {
            query = query.Where(p => p.Price.ToString().Contains(PriceFilter.ToString()));
        }

        if(OrderStatusFilter.HasValue)
        {
            query = query.Where(s => s.OrderStatus == OrderStatusFilter);
        }

        return query;
    }
}