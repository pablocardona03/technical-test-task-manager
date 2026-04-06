namespace TechnicalTest.Application.DTOs.Tasks;

public sealed class CreateTaskRequest
{
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public int AssignedUserId { get; init; }
    public int CreatedByUserId { get; init; }
    public string? AdditionalDataJson { get; init; }
}
