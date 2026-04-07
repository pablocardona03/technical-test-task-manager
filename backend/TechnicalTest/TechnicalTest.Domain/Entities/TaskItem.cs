using TechnicalTest.Domain.Enums;

namespace TechnicalTest.Domain.Entities;

public class TaskItem
{
    public int Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public TaskItemStatus Status { get; private set; }
    public int AssignedUserId { get; private set; }
    public int CreatedByUserId { get; private set; }
    public string AdditionalDataJson { get; private set; } = "{}";
    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }

    public User? AssignedUser { get; private set; }
    public User? CreatedByUser { get; private set; }

    private TaskItem()
    {
    }

    public TaskItem(string title, string? description, int assignedUserId, int createdByUserId, string additionalDataJson)
    {
        Title = title;
        Description = description;
        AssignedUserId = assignedUserId;
        CreatedByUserId = createdByUserId;
        AdditionalDataJson = string.IsNullOrWhiteSpace(additionalDataJson) ? "{}" : additionalDataJson;
        Status = TaskItemStatus.Pending;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(string title, string? description, int assignedUserId, int createdByUserId, string additionalDataJson)
    {
        Title = title;
        Description = description;
        AssignedUserId = assignedUserId;
        CreatedByUserId = createdByUserId;
        AdditionalDataJson = string.IsNullOrWhiteSpace(additionalDataJson) ? "{}" : additionalDataJson;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateStatus(TaskItemStatus status)
    {
        Status = status;
        UpdatedAt = DateTime.UtcNow;
    }
}
