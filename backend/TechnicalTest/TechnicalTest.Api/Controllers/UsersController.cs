using Microsoft.AspNetCore.Mvc;
using TechnicalTest.Application.DTOs.Users;
using TechnicalTest.Application.Interfaces.Services;

namespace TechnicalTest.Api.Controllers;

[ApiController]
[Route("api/users")]
public sealed class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<UserResponse>> Create([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        var response = await _userService.CreateAsync(request, cancellationToken);

        return CreatedAtAction(nameof(GetAll), new { id = response.Id }, response);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<UserResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<UserResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var response = await _userService.GetAllAsync(cancellationToken);

        return Ok(response);
    }
}
