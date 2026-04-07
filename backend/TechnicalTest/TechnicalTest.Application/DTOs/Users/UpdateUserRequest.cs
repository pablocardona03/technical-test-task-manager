using TechnicalTest.Domain.Enums;

namespace TechnicalTest.Application.DTOs.Users;

public sealed class UpdateUserRequest
{
    public string Name { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public UserRole Role { get; init; }
    public bool IsActive { get; init; }
}
