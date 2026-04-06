using TechnicalTest.Application.DTOs.Tasks;

namespace TechnicalTest.Application.Interfaces.Services;

public interface ITaskService
{
    Task<TaskResponse> CreateAsync(CreateTaskRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<TaskResponse>> GetAllAsync(TaskQueryFilters filters, CancellationToken cancellationToken = default);
    Task<TaskResponse> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<TaskResponse> UpdateStatusAsync(int id, UpdateTaskStatusRequest request, CancellationToken cancellationToken = default);
}
