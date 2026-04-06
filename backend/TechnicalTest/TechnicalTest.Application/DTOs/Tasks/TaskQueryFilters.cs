using TechnicalTest.Domain.Enums;

namespace TechnicalTest.Application.DTOs.Tasks;

public sealed class TaskQueryFilters
{
    public TaskItemStatus? Status { get; init; }
    public int? AssignedUserId { get; init; }
    public int? CreatedByUserId { get; init; }
    public string? Priority { get; init; }
    public string? EstimatedEndDate { get; init; }
    public string? Tag { get; init; }
}
