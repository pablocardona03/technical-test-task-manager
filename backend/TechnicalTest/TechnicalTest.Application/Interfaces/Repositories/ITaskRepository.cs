using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TechnicalTest.Application.DTOs.Tasks;
using TechnicalTest.Domain.Entities;

namespace TechnicalTest.Application.Interfaces.Repositories;

public interface ITaskRepository
{
    Task<TaskItem?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<TaskItem>> GetAllAsync(TaskQueryFilters filters, CancellationToken cancellationToken = default);
    Task<TaskItem> AddAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task UpdateAsync(TaskItem task, CancellationToken cancellationToken = default);
}
