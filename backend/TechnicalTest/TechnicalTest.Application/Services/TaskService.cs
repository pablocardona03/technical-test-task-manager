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
        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new BusinessRuleException("Task title is required.");
        }

        if (request.AssignedUserId <= 0)
        {
            throw new BusinessRuleException("Assigned user is required.");
        }

        if (request.CreatedByUserId <= 0)
        {
            throw new BusinessRuleException("Created by user is required.");
        }

        if (!await _userRepository.ExistsByIdAsync(request.AssignedUserId, cancellationToken))
        {
            throw new NotFoundException("Assigned user was not found.");
        }

        if (!await _userRepository.ExistsByIdAsync(request.CreatedByUserId, cancellationToken))
        {
            throw new NotFoundException("Created by user was not found.");
        }

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
}
