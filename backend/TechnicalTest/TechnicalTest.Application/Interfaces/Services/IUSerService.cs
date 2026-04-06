using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechnicalTest.Application.DTOs.Users;

namespace TechnicalTest.Application.Interfaces.Services
{
    public interface IUserService
    {
        Task<UserResponse> CreateAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
        Task<IReadOnlyCollection<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    }
}
