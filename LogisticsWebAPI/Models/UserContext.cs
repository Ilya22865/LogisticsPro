using Microsoft.EntityFrameworkCore;

namespace LogisticsWebAPI.Models
{
    public class UserContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Cargo> Cargos { get; set; }
        public DbSet<Driver> Drivers { get; set; }
        public DbSet<Truck> Trucks { get; set; }
        public DbSet<Route> Routes { get; set; }

        public UserContext(DbContextOptions<UserContext> options) : base(options)
        {
            Database.EnsureCreated();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User -> User (CompanyId references another User, e.g. company admin)
            modelBuilder.Entity<User>()
                .HasOne(u => u.CompanyUser)
                .WithMany()
                .HasForeignKey(u => u.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            // Order -> User (n к 1)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserID)
                .OnDelete(DeleteBehavior.Restrict);

            // Order -> Cargo (1 к n) — CargoID in Order references Cargo
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Cargo)
                .WithMany()
                .HasForeignKey(o => o.CargoID)
                .OnDelete(DeleteBehavior.Restrict);

            // Order -> Driver (n к 1)
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Driver)
                .WithMany()
                .HasForeignKey(o => o.DriverID)
                .OnDelete(DeleteBehavior.Restrict);

            // Driver -> Truck (1 к 1)
            modelBuilder.Entity<Driver>()
                .HasOne(d => d.Truck)
                .WithMany()
                .HasForeignKey(d => d.TruckID)
                .OnDelete(DeleteBehavior.Restrict);

            // Route -> Order (n к 1)
            modelBuilder.Entity<Route>()
                .HasOne(r => r.Order)
                .WithMany()
                .HasForeignKey(r => r.OrderID)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
