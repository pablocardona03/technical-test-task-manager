IF DB_ID(N'TechnicalTestTasksDb') IS NULL
BEGIN
    CREATE DATABASE TechnicalTestTasksDb;
END
GO

USE TechnicalTestTasksDb;
GO

IF OBJECT_ID(N'dbo.Tasks', N'U') IS NOT NULL
    DROP TABLE dbo.Tasks;
GO

IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL
    DROP TABLE dbo.Users;
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