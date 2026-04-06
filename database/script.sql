USE master;
GO

IF DB_ID(N'TechnicalTestTasksDb') IS NOT NULL
BEGIN
    ALTER DATABASE TechnicalTestTasksDb SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE TechnicalTestTasksDb;
END
GO

CREATE DATABASE TechnicalTestTasksDb;
GO

USE TechnicalTestTasksDb;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

CREATE TABLE dbo.Users
(
    Id INT IDENTITY(1,1) NOT NULL,
    Name NVARCHAR(150) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Users PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT CK_Users_Role CHECK (Role IN ('Admin', 'Manager', 'Collaborator'))
);
GO

CREATE TABLE dbo.Tasks
(
    Id INT IDENTITY(1,1) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    Status VARCHAR(20) NOT NULL CONSTRAINT DF_Tasks_Status DEFAULT 'Pending',
    AssignedUserId INT NOT NULL,
    CreatedByUserId INT NOT NULL,
    AdditionalDataJson NVARCHAR(MAX) NOT NULL CONSTRAINT DF_Tasks_AdditionalDataJson DEFAULT N'{}',
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Tasks_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL CONSTRAINT DF_Tasks_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_Tasks PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_Tasks_AssignedUserId FOREIGN KEY (AssignedUserId) REFERENCES dbo.Users(Id),
    CONSTRAINT FK_Tasks_CreatedByUserId FOREIGN KEY (CreatedByUserId) REFERENCES dbo.Users(Id),
    CONSTRAINT CK_Tasks_Status CHECK (Status IN ('Pending', 'InProgress', 'Done')),
    CONSTRAINT CK_Tasks_AdditionalDataJson_IsJson CHECK (ISJSON(AdditionalDataJson) = 1)
);
GO

CREATE INDEX IX_Tasks_AssignedUserId_Status_CreatedAt
ON dbo.Tasks (AssignedUserId, Status, CreatedAt DESC);
GO

CREATE INDEX IX_Tasks_CreatedByUserId_CreatedAt
ON dbo.Tasks (CreatedByUserId, CreatedAt DESC);
GO

BEGIN TRANSACTION;

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