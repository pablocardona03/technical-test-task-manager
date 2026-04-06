using Microsoft.Extensions.DependencyInjection;
using TechnicalTest.Application.Interfaces.Services;
using TechnicalTest.Application.Services;

namespace TechnicalTest.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ITaskService, TaskService>();

        return services;
    }
}