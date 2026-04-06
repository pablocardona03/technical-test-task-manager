using Microsoft.AspNetCore.Mvc;
using TechnicalTest.Application.DTOs.Tasks;
using TechnicalTest.Application.Interfaces.Services;

namespace TechnicalTest.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public sealed class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskResponse>> Create([FromBody] CreateTaskRequest request, CancellationToken cancellationToken)
    {
        var response = await _taskService.CreateAsync(request, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<TaskResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<TaskResponse>>> GetAll([FromQuery] TaskQueryFilters filters, CancellationToken cancellationToken)
    {
        var response = await _taskService.GetAllAsync(filters, cancellationToken);

        return Ok(response);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var response = await _taskService.GetByIdAsync(id, cancellationToken);

        return Ok(response);
    }

    [HttpPut("{id:int}/status")]
    [ProducesResponseType(typeof(TaskResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TaskResponse>> UpdateStatus(int id, [FromBody] UpdateTaskStatusRequest request, CancellationToken cancellationToken)
    {
        var response = await _taskService.UpdateStatusAsync(id, request, cancellationToken);

        return Ok(response);
    }
}
