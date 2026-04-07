using TechnicalTest.Application.DTOs.Users;
using TechnicalTest.Application.Exceptions;
using TechnicalTest.Application.Interfaces.Repositories;
using TechnicalTest.Application.Interfaces.Services;
using TechnicalTest.Domain.Entities;

namespace TechnicalTest.Application.Services;

public sealed class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUserRequest(request.Name, request.Email);

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        if (await _userRepository.ExistsByEmailAsync(normalizedEmail, null, cancellationToken))
        {
            throw new ConflictException("A user with the same email already exists.");
        }

        var user = new User(request.Name.Trim(), normalizedEmail, request.Role, request.IsActive);

        var createdUser = await _userRepository.AddAsync(user, cancellationToken);

        return MapToResponse(createdUser);
    }

    public async Task<IReadOnlyCollection<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);

        return users
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<UserResponse> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);

        if (user is null)
        {
            throw new NotFoundException("User was not found.");
        }

        return MapToResponse(user);
    }

    public async Task<UserResponse> UpdateAsync(int id, UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);

        if (user is null)
        {
            throw new NotFoundException("User was not found.");
        }

        ValidateUserRequest(request.Name, request.Email);

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        if (await _userRepository.ExistsByEmailAsync(normalizedEmail, id, cancellationToken))
        {
            throw new ConflictException("A user with the same email already exists.");
        }

        user.UpdateDetails(request.Name.Trim(), normalizedEmail, request.Role, request.IsActive);

        await _userRepository.UpdateAsync(user, cancellationToken);

        return MapToResponse(user);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(id, cancellationToken);

        if (user is null)
        {
            throw new NotFoundException("User was not found.");
        }

        if (await _userRepository.HasRelatedTasksAsync(id, cancellationToken))
        {
            throw new ConflictException("This user cannot be deleted because it is linked to one or more tasks. Deactivate the user instead.");
        }

        await _userRepository.DeleteAsync(user, cancellationToken);
    }

    private static void ValidateUserRequest(string name, string email)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new BusinessRuleException("User name is required.");
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new BusinessRuleException("User email is required.");
        }
    }

    private static UserResponse MapToResponse(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}
