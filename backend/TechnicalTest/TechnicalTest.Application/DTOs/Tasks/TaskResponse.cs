using TechnicalTest.Domain.Enums;

namespace TechnicalTest.Application.DTOs.Tasks;

public sealed class TaskResponse
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public TaskItemStatus Status { get; init; }
    public int AssignedUserId { get; init; }
    public string AssignedUserName { get; init; } = string.Empty;
    public int CreatedByUserId { get; init; }
    public string CreatedByUserName { get; init; } = string.Empty;
    public string AdditionalDataJson { get; init; } = "{}";
    public string? Priority { get; init; }
    public string? EstimatedEndDate { get; init; }
    public IReadOnlyCollection<string> Tags { get; init; } = [];
    public IReadOnlyCollection<TaskAdditionalItemResponse> AdditionalItems { get; init; } = [];
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}
