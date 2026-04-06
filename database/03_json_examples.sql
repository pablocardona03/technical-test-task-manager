USE TechnicalTestTasksDb;
GO

PRINT 'Collaborator view: only assigned tasks filtered by status ordered by creation date';
SELECT
    au.Name AS AssignedUser,
    cu.Name AS CreatedByUser,
    t.Id,
    t.Title,
    t.Status,
    t.CreatedAt
FROM dbo.Tasks t
INNER JOIN dbo.Users au ON au.Id = t.AssignedUserId
INNER JOIN dbo.Users cu ON cu.Id = t.CreatedByUserId
WHERE t.AssignedUserId = 3
  AND t.Status = 'Pending'
ORDER BY t.CreatedAt DESC;
GO

PRINT 'Admin view: all tasks with creator and assignee';
SELECT
    t.Id,
    t.Title,
    t.Status,
    au.Name AS AssignedUser,
    cu.Name AS CreatedByUser,
    t.CreatedAt,
    t.UpdatedAt
FROM dbo.Tasks t
INNER JOIN dbo.Users au ON au.Id = t.AssignedUserId
INNER JOIN dbo.Users cu ON cu.Id = t.CreatedByUserId
ORDER BY t.CreatedAt DESC;
GO

PRINT 'Validate JSON with ISJSON';
SELECT
    t.Id,
    t.Title,
    ISJSON(t.AdditionalDataJson) AS IsValidJson
FROM dbo.Tasks t
ORDER BY t.Id;
GO

PRINT 'Read fields from JSON with JSON_VALUE';
SELECT
    t.Id,
    t.Title,
    JSON_VALUE(t.AdditionalDataJson, '$.priority') AS Priority,
    JSON_VALUE(t.AdditionalDataJson, '$.estimatedEndDate') AS EstimatedEndDate
FROM dbo.Tasks t
ORDER BY t.Id;
GO

PRINT 'Read arrays from JSON with JSON_QUERY';
SELECT
    t.Id,
    t.Title,
    JSON_QUERY(t.AdditionalDataJson, '$.tags') AS Tags
FROM dbo.Tasks t
ORDER BY t.Id;
GO

PRINT 'Filter tasks using a value inside JSON';
SELECT
    t.Id,
    t.Title,
    t.Status,
    JSON_VALUE(t.AdditionalDataJson, '$.priority') AS Priority
FROM dbo.Tasks t
WHERE JSON_VALUE(t.AdditionalDataJson, '$.priority') = 'High'
ORDER BY t.CreatedAt DESC;
GO

PRINT 'Expand tags with OPENJSON';
SELECT
    t.Id,
    t.Title,
    j.[value] AS Tag
FROM dbo.Tasks t
CROSS APPLY OPENJSON(t.AdditionalDataJson, '$.tags') j
ORDER BY t.Id, j.[value];
GO

PRINT 'Update one JSON field with JSON_MODIFY';
BEGIN TRANSACTION;

UPDATE dbo.Tasks
SET AdditionalDataJson = JSON_MODIFY(AdditionalDataJson, '$.priority', 'Medium'),
    UpdatedAt = SYSUTCDATETIME()
WHERE Id = 1;

SELECT
    t.Id,
    t.Title,
    JSON_VALUE(t.AdditionalDataJson, '$.priority') AS UpdatedPriority,
    t.UpdatedAt
FROM dbo.Tasks t
WHERE t.Id = 1;

ROLLBACK TRANSACTION;
GO