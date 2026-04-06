USE TechnicalTestTasksDb;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL OR OBJECT_ID(N'dbo.Tasks', N'U') IS NULL
    THROW 50001, 'Run 01_schema.sql before 02_seed.sql.', 1;
GO

BEGIN TRANSACTION;

DELETE FROM dbo.Tasks;
DBCC CHECKIDENT ('dbo.Tasks', RESEED, 0);

DELETE FROM dbo.Users;
DBCC CHECKIDENT ('dbo.Users', RESEED, 0);

INSERT INTO dbo.Users (Name, Email, Role, IsActive, CreatedAt)
VALUES
(N'Admin Principal', N'admin.app@example.com', 'Admin', 1, '2026-04-06T08:30:00'),
(N'Laura Manager', N'laura.manager@example.com', 'Manager', 1, '2026-04-06T08:45:00'),
(N'Pablo Cardona', N'pablo.cardona@example.com', 'Collaborator', 1, '2026-04-06T09:00:00'),
(N'Maria Gomez', N'maria.gomez@example.com', 'Collaborator', 1, '2026-04-06T09:15:00'),
(N'Carlos Ruiz', N'carlos.ruiz@example.com', 'Collaborator', 1, '2026-04-06T09:30:00');

INSERT INTO dbo.Tasks (Title, Description, Status, AssignedUserId, CreatedByUserId, AdditionalDataJson, CreatedAt, UpdatedAt)
VALUES
(
    N'Configurar backend inicial',
    N'Crear estructura base de la API',
    'Pending',
    3,
    2,
    N'{"priority":"High","estimatedEndDate":"2026-04-08","tags":["backend","api"],"metadata":{"source":"manager"}}',
    '2026-04-06T10:00:00',
    '2026-04-06T10:00:00'
),
(
    N'Construir formulario Angular',
    N'Crear formulario reactivo para tareas',
    'InProgress',
    4,
    2,
    N'{"priority":"Medium","estimatedEndDate":"2026-04-09","tags":["frontend","angular"],"metadata":{"source":"manager"}}',
    '2026-04-06T10:30:00',
    '2026-04-06T11:15:00'
),
(
    N'Probar cambio de estados',
    N'Validar regla de transición de tareas',
    'Done',
    3,
    2,
    N'{"priority":"Low","estimatedEndDate":"2026-04-10","tags":["testing"],"metadata":{"source":"manager"}}',
    '2026-04-06T11:00:00',
    '2026-04-06T12:00:00'
),
(
    N'Preparar consultas JSON',
    N'Demostrar JSON_VALUE, JSON_QUERY y OPENJSON',
    'Pending',
    4,
    1,
    N'{"priority":"Medium","estimatedEndDate":"2026-04-10","tags":["sql","json"],"metadata":{"source":"admin"}}',
    '2026-04-06T12:00:00',
    '2026-04-06T12:00:00'
),
(
    N'Revisar endpoints de usuarios',
    N'Validar el módulo de gestión de usuarios',
    'Pending',
    5,
    1,
    N'{"priority":"High","estimatedEndDate":"2026-04-11","tags":["backend","users"],"metadata":{"source":"admin"}}',
    '2026-04-06T12:30:00',
    '2026-04-06T12:30:00'
);

COMMIT TRANSACTION;
GO