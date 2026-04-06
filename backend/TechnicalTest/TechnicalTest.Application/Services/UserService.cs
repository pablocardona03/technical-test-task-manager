using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new BusinessRuleException("User name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Email))
        {
            throw new BusinessRuleException("User email is required.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        if (await _userRepository.ExistsByEmailAsync(normalizedEmail, cancellationToken))
        {
            throw new ConflictException("A user with the same email already exists.");
        }

        var user = new User(request.Name.Trim(), normalizedEmail, request.Role);

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
