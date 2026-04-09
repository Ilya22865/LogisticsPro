using Microsoft.EntityFrameworkCore;

namespace LogisticsWebAPI.Models
{
    public class DriverContext : DbContext
    {
        public DbSet<Driver> Drivers { get; set; }
        public DbSet<Truck> Trucks { get; set; }
        public DbSet<Order> Orders { get; set; }

        public DriverContext(DbContextOptions<DriverContext> options) : base(options)
        {
            Database.EnsureCreated();
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Existing table names
            modelBuilder.Entity<Driver>().ToTable("Driver");
            modelBuilder.Entity<Truck>().ToTable("Truck");

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
