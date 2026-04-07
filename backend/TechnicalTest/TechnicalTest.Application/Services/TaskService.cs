using System.Text.Json;
using TechnicalTest.Application.DTOs.Tasks;
using TechnicalTest.Application.Exceptions;
using TechnicalTest.Application.Interfaces.Repositories;
using TechnicalTest.Application.Interfaces.Services;
using TechnicalTest.Domain.Entities;
using TechnicalTest.Domain.Enums;

namespace TechnicalTest.Application.Services;

public sealed class TaskService : ITaskService
{
    private readonly ITaskRepository _taskRepository;
    private readonly IUserRepository _userRepository;

    public TaskService(ITaskRepository taskRepository, IUserRepository userRepository)
    {
        _taskRepository = taskRepository;
        _userRepository = userRepository;
    }

    public async Task<TaskResponse> CreateAsync(CreateTaskRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateTaskRequestAsync(request.Title, request.AssignedUserId, request.CreatedByUserId, cancellationToken);

        var normalizedJson = NormalizeJson(request.AdditionalDataJson);

        var task = new TaskItem(
            request.Title.Trim(),
            string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            request.AssignedUserId,
            request.CreatedByUserId,
            normalizedJson);

        var createdTask = await _taskRepository.AddAsync(task, cancellationToken);
        var taskWithUsers = await _taskRepository.GetByIdAsync(createdTask.Id, cancellationToken);

        return MapToResponse(taskWithUsers ?? createdTask);
    }

    public async Task<IReadOnlyCollection<TaskResponse>> GetAllAsync(TaskQueryFilters filters, CancellationToken cancellationToken = default)
    {
        var tasks = await _taskRepository.GetAllAsync(filters, cancellationToken);

        return tasks
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<TaskResponse> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(id, cancellationToken);

        if (task is null)
        {
            throw new NotFoundException("Task was not found.");
        }

        return MapToResponse(task);
    }

    public async Task<TaskResponse> UpdateAsync(int id, UpdateTaskRequest request, CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(id, cancellationToken);

        if (task is null)
        {
            throw new NotFoundException("Task was not found.");
        }

        await ValidateTaskRequestAsync(request.Title, request.AssignedUserId, request.CreatedByUserId, cancellationToken);

        var normalizedJson = NormalizeJson(request.AdditionalDataJson);

        task.UpdateDetails(
            request.Title.Trim(),
            string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            request.AssignedUserId,
            request.CreatedByUserId,
            normalizedJson);

        await _taskRepository.UpdateAsync(task, cancellationToken);

        var updatedTask = await _taskRepository.GetByIdAsync(id, cancellationToken);

        return MapToResponse(updatedTask ?? task);
    }

    public async Task<TaskResponse> UpdateStatusAsync(int id, UpdateTaskStatusRequest request, CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(id, cancellationToken);

        if (task is null)
        {
            throw new NotFoundException("Task was not found.");
        }

        if (task.Status == TaskItemStatus.Pending && request.Status == TaskItemStatus.Done)
        {
            throw new BusinessRuleException("A task cannot move directly from Pending to Done.");
        }

        task.UpdateStatus(request.Status);

        await _taskRepository.UpdateAsync(task, cancellationToken);

        var updatedTask = await _taskRepository.GetByIdAsync(id, cancellationToken);

        return MapToResponse(updatedTask ?? task);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var task = await _taskRepository.GetByIdAsync(id, cancellationToken);

        if (task is null)
        {
            throw new NotFoundException("Task was not found.");
        }

        await _taskRepository.DeleteAsync(task, cancellationToken);
    }

    private async Task ValidateTaskRequestAsync(string title, int assignedUserId, int createdByUserId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new BusinessRuleException("Task title is required.");
        }

        if (assignedUserId <= 0)
        {
            throw new BusinessRuleException("Assigned user is required.");
        }

        if (createdByUserId <= 0)
        {
            throw new BusinessRuleException("Created by user is required.");
        }

        var assignedUser = await _userRepository.GetByIdAsync(assignedUserId, cancellationToken);
        if (assignedUser is null)
        {
            throw new NotFoundException("Assigned user was not found.");
        }

        if (!assignedUser.IsActive)
        {
            throw new BusinessRuleException("Assigned user must be active.");
        }

        var createdByUser = await _userRepository.GetByIdAsync(createdByUserId, cancellationToken);
        if (createdByUser is null)
        {
            throw new NotFoundException("Created by user was not found.");
        }

        if (!createdByUser.IsActive)
        {
            throw new BusinessRuleException("Created by user must be active.");
        }
    }

    private static string NormalizeJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return "{}";
        }

        try
        {
            using var document = JsonDocument.Parse(json);
            return document.RootElement.GetRawText();
        }
        catch (JsonException)
        {
            throw new BusinessRuleException("Additional task data must be valid JSON.");
        }
    }

    private static TaskResponse MapToResponse(TaskItem task)
    {
        return new TaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            AssignedUserId = task.AssignedUserId,
            AssignedUserName = task.AssignedUser?.Name ?? string.Empty,
            CreatedByUserId = task.CreatedByUserId,
            CreatedByUserName = task.CreatedByUser?.Name ?? string.Empty,
            AdditionalDataJson = task.AdditionalDataJson,
            Priority = ReadJsonString(task.AdditionalDataJson, "priority"),
            EstimatedEndDate = ReadJsonString(task.AdditionalDataJson, "estimatedEndDate"),
            Tags = ReadJsonArray(task.AdditionalDataJson, "tags"),
            AdditionalItems = ReadAdditionalItems(task.AdditionalDataJson),
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        };
    }

    private static string? ReadJsonString(string json, string propertyName)
    {
        try
        {
            using var document = JsonDocument.Parse(json);

            if (!document.RootElement.TryGetProperty(propertyName, out var property))
            {
                return null;
            }

            return property.ValueKind == JsonValueKind.String
                ? property.GetString()
                : property.GetRawText();
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static IReadOnlyCollection<string> ReadJsonArray(string json, string propertyName)
    {
        try
        {
            using var document = JsonDocument.Parse(json);

            if (!document.RootElement.TryGetProperty(propertyName, out var property) || property.ValueKind != JsonValueKind.Array)
            {
                return [];
            }

            return property
                .EnumerateArray()
                .Select(x => x.ValueKind == JsonValueKind.String ? x.GetString() ?? string.Empty : x.GetRawText())
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .ToList();
        }
        catch (JsonException)
        {
            return [];
        }
    }

    private static IReadOnlyCollection<TaskAdditionalItemResponse> ReadAdditionalItems(string json)
    {
        try
        {
            using var document = JsonDocument.Parse(json);
            var items = new List<TaskAdditionalItemResponse>();

            if (document.RootElement.TryGetProperty("additionalItems", out var additionalItemsElement)
                && additionalItemsElement.ValueKind == JsonValueKind.Array)
            {
                items.AddRange(
                    additionalItemsElement
                        .EnumerateArray()
                        .Select(ToAdditionalItem)
                        .Where(x => x is not null)
                        .Cast<TaskAdditionalItemResponse>());
            }

            if (document.RootElement.TryGetProperty("metadata", out var metadataElement)
                && metadataElement.ValueKind == JsonValueKind.Object)
            {
                items.AddRange(
                    metadataElement
                        .EnumerateObject()
                        .Select(property => new TaskAdditionalItemResponse
                        {
                            Title = property.Name,
                            Description = property.Value.ValueKind == JsonValueKind.String
                                ? property.Value.GetString() ?? string.Empty
                                : property.Value.GetRawText()
                        })
                        .Where(item => !string.IsNullOrWhiteSpace(item.Title) && !string.IsNullOrWhiteSpace(item.Description)));
            }

            return items;
        }
        catch (JsonException)
        {
            return [];
        }
    }

    private static TaskAdditionalItemResponse? ToAdditionalItem(JsonElement element)
    {
        if (element.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        var title = element.TryGetProperty("title", out var titleElement) && titleElement.ValueKind == JsonValueKind.String
            ? titleElement.GetString()
            : null;

        var description = element.TryGetProperty("description", out var descriptionElement) && descriptionElement.ValueKind == JsonValueKind.String
            ? descriptionElement.GetString()
            : null;

        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(description))
        {
            return null;
        }

        return new TaskAdditionalItemResponse
        {
            Title = title,
            Description = description
        };
    }
}
