using Microsoft.EntityFrameworkCore;

namespace LogisticsWebAPI.Models
{
    public class UserContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Order> Orders { get; set; }

        public DbSet<Driver> Drivers { get; set; }
        public DbSet<Truck> Trucks { get; set; }
        public DbSet<Cargo> Cargos { get; set; }
        public DbSet<Route> Routes { get; set; }

        public UserContext(DbContextOptions<UserContext> options) : base(options)
        {
            Database.EnsureCreated();
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Order>()
                .HasOne(u => u.User)
                .WithMany(o => o.Orders)
                .HasForeignKey(u => u.UserID)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Cargo>()
                .HasOne(o => o.Order)
                .WithMany(c => c.Cargos)
                .HasForeignKey(o => o.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(r => r.Route)
                .WithMany(o => o.Orders)
                .HasForeignKey(r => r.RouteId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Driver>()
                .HasOne(t => t.Truck)
                .WithOne(d => d.Driver)
                .HasForeignKey<Driver>(t => t.TruckId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(d => d.Driver)
                .WithMany(o => o.Orders)
                .HasForeignKey(d => d.DriverID)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
