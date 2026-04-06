using TechnicalTest.Domain.Enums;

namespace TechnicalTest.Application.DTOs.Tasks;

public sealed class UpdateTaskStatusRequest
{
    public TaskItemStatus Status { get; init; }
}
