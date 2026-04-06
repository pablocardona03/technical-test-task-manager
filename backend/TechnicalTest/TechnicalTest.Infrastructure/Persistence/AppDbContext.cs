using Microsoft.EntityFrameworkCore;
using TechnicalTest.Domain.Entities;
using TechnicalTest.Infrastructure.Persistence.Configurations;

namespace TechnicalTest.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new UserConfiguration());
        modelBuilder.ApplyConfiguration(new TaskItemConfiguration());

        base.OnModelCreating(modelBuilder);
    }
}
