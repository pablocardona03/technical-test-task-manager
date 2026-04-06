using System.Text;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TechnicalTest.Application.DTOs.Tasks;
using TechnicalTest.Application.Interfaces.Repositories;
using TechnicalTest.Domain.Entities;
using TechnicalTest.Infrastructure.Persistence;

namespace TechnicalTest.Infrastructure.Repositories;

public sealed class TaskRepository : ITaskRepository
{
    private readonly AppDbContext _context;

    public TaskRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TaskItem?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Tasks
            .AsNoTracking()
            .Include(x => x.AssignedUser)
            .Include(x => x.CreatedByUser)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyCollection<TaskItem>> GetAllAsync(TaskQueryFilters filters, CancellationToken cancellationToken = default)
    {
        var sql = new StringBuilder("SELECT * FROM dbo.Tasks AS t WHERE 1 = 1");
        var parameters = new List<object>();

        if (filters.Status.HasValue)
        {
            sql.Append(" AND t.[Status] = @status");
            parameters.Add(new SqlParameter("@status", filters.Status.Value.ToString()));
        }

        if (filters.AssignedUserId.HasValue)
        {
            sql.Append(" AND t.[AssignedUserId] = @assignedUserId");
            parameters.Add(new SqlParameter("@assignedUserId", filters.AssignedUserId.Value));
        }

        if (filters.CreatedByUserId.HasValue)
        {
            sql.Append(" AND t.[CreatedByUserId] = @createdByUserId");
            parameters.Add(new SqlParameter("@createdByUserId", filters.CreatedByUserId.Value));
        }

        if (!string.IsNullOrWhiteSpace(filters.Priority))
        {
            sql.Append(" AND JSON_VALUE(t.[AdditionalDataJson], '$.priority') = @priority");
            parameters.Add(new SqlParameter("@priority", filters.Priority.Trim()));
        }

        if (!string.IsNullOrWhiteSpace(filters.EstimatedEndDate))
        {
            sql.Append(" AND JSON_VALUE(t.[AdditionalDataJson], '$.estimatedEndDate') = @estimatedEndDate");
            parameters.Add(new SqlParameter("@estimatedEndDate", filters.EstimatedEndDate.Trim()));
        }

        if (!string.IsNullOrWhiteSpace(filters.Tag))
        {
            sql.Append(" AND EXISTS (SELECT 1 FROM OPENJSON(t.[AdditionalDataJson], '$.tags') AS tags WHERE tags.[value] = @tag)");
            parameters.Add(new SqlParameter("@tag", filters.Tag.Trim()));
        }

        var query = _context.Tasks
            .FromSqlRaw(sql.ToString(), parameters.ToArray())
            .AsNoTracking()
            .Include(x => x.AssignedUser)
            .Include(x => x.CreatedByUser);

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<TaskItem> AddAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        _context.Tasks.Add(task);
        await _context.SaveChangesAsync(cancellationToken);

        return task;
    }

    public async Task UpdateAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
