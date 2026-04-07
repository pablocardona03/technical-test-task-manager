# Task Management Fullstack Challenge

## Overview

Technical test solution for an internal task management system built with:

- .NET 8 Web API
- Angular 21
- SQL Server 2022
- Docker Compose for local orchestration

The solution covers the requested minimum scope: user management, task management, status changes with business rules, and JSON handling in SQL Server.

## Repository structure

```text
.
├── backend/
│   └── TechnicalTest/
│       ├── TechnicalTest.Api/
│       ├── TechnicalTest.Application/
│       ├── TechnicalTest.Domain/
│       └── TechnicalTest.Infrastructure/
├── database/
│   ├── 01_schema.sql
│   ├── 02_seed.sql
│   ├── 03_json_examples.sql
│   └── script.sql
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── core/
│   │       │   ├── config/
│   │       │   └── layout/
│   │       ├── features/
│   │       │   ├── tasks/
│   │       │   │   ├── components/
│   │       │   │   ├── data-access/
│   │       │   │   ├── models/
│   │       │   │   └── pages/
│   │       │   └── users/
│   │       │       ├── components/
│   │       │       ├── data-access/
│   │       │       ├── models/
│   │       │       └── pages/
│   │       ├── shared/
│   │       │   ├── ui/
│   │       │   └── utils/
│   │       ├── app.config.ts
│   │       ├── app.routes.ts
│   │       └── app.ts
│   ├── angular.json
│   ├── package.json
│   └── proxy.conf.json
├── .env.example
└── docker-compose.yml
```

## Main features

### Users

- Create users
- List users
- Update users
- Prevent duplicate emails
- Prevent deletion when the user is related to tasks

### Tasks

- Create tasks
- List tasks
- Update tasks
- Delete tasks
- Change task status
- Prevent direct transition from `Pending` to `Done`
- Require title and assigned user

### SQL Server JSON support

- `AdditionalDataJson` column in `Tasks`
- JSON validation with `ISJSON`
- Field extraction with `JSON_VALUE`
- Array extraction with `JSON_QUERY`
- Array expansion with `OPENJSON`
- JSON filtering from the API repository layer
- Optional field update example with `JSON_MODIFY`

## Configuration sources

This project can be executed in two different ways, and each one uses a different configuration source.

### When using Docker Compose

The project uses:

```text
.env
```

That file is consumed by Docker Compose to start SQL Server and the other containers.

### When using `dotnet run` locally

The backend does not read `.env` automatically.

For local manual execution, the backend must use one of these:

- `backend/TechnicalTest/TechnicalTest.Api/appsettings.Development.json`
- real environment variables loaded in the shell session

For this technical test, the simplest and clearest option is to configure:

```text
backend/TechnicalTest/TechnicalTest.Api/appsettings.Development.json
```

## Recommended execution path

For any evaluator, the recommended path is:

```text
Docker Compose
```

It is the most portable option because it does not depend on a specific local SQL Server instance.

## Option 1: Run the full project with Docker Compose

### Prerequisites

- Docker Desktop
- Docker Compose

### Step 1

Create a `.env` file from `.env.example`.

Example content:

```env
SA_PASSWORD=Your_password123!
ConnectionStrings__DefaultConnection=Server=localhost,1433;Database=TechnicalTestTasksDb;User Id=sa;Password=Your_password123!;TrustServerCertificate=True;Encrypt=False;MultipleActiveResultSets=True
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=https://localhost:7094;http://localhost:5103
```

Important note:

- for Docker Compose, the only value really required by the containers is `SA_PASSWORD`
- the backend container uses the connection string defined inside `docker-compose.yml`
- the other values are kept here as documentation for local manual execution

### Step 2

Run the full stack:

```bash
docker compose up --build
```

### Step 3

Open the application:

- Frontend: `http://localhost:4200`
- API: `http://localhost:8080/api/users`

### What should happen

- SQL Server starts in Docker
- `database/script.sql` initializes the database automatically
- the backend starts and connects to the SQL Server container
- the frontend starts and proxies `/api` requests through Nginx to the backend container

### What to validate

- users list loads
- tasks list loads
- a new user can be created
- a new task can be created
- a task can move from `Pending` to `InProgress`
- a task can move from `InProgress` to `Done`
- a task cannot move directly from `Pending` to `Done`

## Option 2: Run the database script and execute backend and frontend locally

This path is useful if the evaluator wants to run the backend and frontend directly on the machine instead of Docker.

### Prerequisites

- .NET 8 SDK
- Node.js 22 or compatible LTS version
- npm
- SQL Server 2022, SQL Server Express, or another local SQL Server instance

### Step 1

Run the database creation script manually in SQL Server:

```text
database/script.sql
```

That script creates:

- the database
- tables
- constraints
- indexes
- seed data

### Step 2

Edit this file:

```text
backend/TechnicalTest/TechnicalTest.Api/appsettings.Development.json
```

The connection string must match the SQL Server instance where `database/script.sql` was executed.

#### Example using Docker SQL Server on localhost

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=TechnicalTestTasksDb;User Id=sa;Password=Your_password123!;TrustServerCertificate=True;Encrypt=False;MultipleActiveResultSets=True"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

#### Example using SQL Server Express

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\SQLEXPRESS;Database=TechnicalTestTasksDb;Trusted_Connection=True;Encrypt=True;TrustServerCertificate=True;MultipleActiveResultSets=True"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

Important note:

- editing `.env` is not enough for `dotnet run`
- the backend does not load `.env` automatically
- for local manual execution, the correct place to configure the connection is `appsettings.Development.json`

### Step 3

Run the backend:

```bash
cd backend/TechnicalTest
dotnet restore
dotnet run --project TechnicalTest.Api
```

The backend should start on:

- `https://localhost:7094`
- `http://localhost:5103`

Swagger:

- `https://localhost:7094/swagger`

If HTTPS certificates are not trusted yet, run once:

```bash
dotnet dev-certs https --trust
```

### Step 4

Open a second terminal and run the frontend:

```bash
cd frontend
npm ci
npm start
```

The frontend uses `proxy.conf.json` and expects the backend at:

- `https://localhost:7094`

Open:

- `http://localhost:4200`

### Step 5

Validate the application behavior:

- users list loads
- tasks list loads
- a new user can be created
- a new task can be created
- status transitions work correctly
- direct transition from `Pending` to `Done` is rejected

## Technical decisions

### Backend

- Clean separation by layers: `Api`, `Application`, `Domain`, `Infrastructure`
- Controllers remain thin and delegate business logic to services
- DTOs are used for requests, responses and query filters
- Business validations are handled in the application layer
- Custom exception middleware maps domain and application errors to HTTP responses
- Entity Framework Core is used for persistence
- SQL Server specific JSON filtering is implemented in the repository with `JSON_VALUE` and `OPENJSON`

### Frontend

- Feature-based organization with `tasks` and `users`
- `core` contains shell, layout and shared application configuration
- `shared` contains reusable UI components and helper utilities
- `data-access` services isolate HTTP communication with the API
- `models` centralize frontend contracts and view types
- `pages` contain route-level orchestration and local state
- Angular standalone components were used to keep the project modular and lightweight
- Reactive forms were used for task and user creation/editing
- Lazy-loaded routes were used for feature pages
- Signals were used for local state handling in pages
- The UI consumes the backend through `/api` and uses a proxy in development
- Task additional information is composed in the frontend and sent as JSON text to the API

### Database

- `Users` and `Tasks` are separated with explicit foreign keys
- `Tasks` stores both `AssignedUserId` and `CreatedByUserId`
- Status is constrained with a check constraint
- `AdditionalDataJson` is validated with `ISJSON`
- Indexes were added for the most common access patterns:
  - by assigned user, status and creation date
  - by creator and creation date
- A single `script.sql` was included for quick evaluator setup, plus separated scripts for schema, seed and JSON examples

### Dev experience

- Docker Compose was included to run SQL Server, API and frontend together
- Nginx was used in the frontend container to serve the Angular build and proxy API requests
- Seed data was included to speed up functional review

## Pending items

The required minimum scope is covered. The following items were intentionally left as future improvements:

- Authentication and authorization
- Automated backend and frontend tests
- Pagination for large task and user datasets
- Frontend support for every API filter exposed by the backend, such as filtering by creator or estimated end date
- Frontend support for deleting users
- CI pipeline for build, test and deployment validation

## Example SQL queries for JSON support

The project already includes examples in `database/03_json_examples.sql`.

### Validate JSON

```sql
SELECT
    Id,
    Title,
    ISJSON(AdditionalDataJson) AS IsValidJson
FROM dbo.Tasks;
```

### Read scalar values from JSON

```sql
SELECT
    Id,
    Title,
    JSON_VALUE(AdditionalDataJson, '$.priority') AS Priority,
    JSON_VALUE(AdditionalDataJson, '$.estimatedEndDate') AS EstimatedEndDate
FROM dbo.Tasks;
```

### Read arrays from JSON

```sql
SELECT
    Id,
    Title,
    JSON_QUERY(AdditionalDataJson, '$.tags') AS Tags
FROM dbo.Tasks;
```

### Filter tasks using a JSON value

```sql
SELECT
    t.Id,
    t.Title,
    t.Status,
    JSON_VALUE(t.AdditionalDataJson, '$.priority') AS Priority
FROM dbo.Tasks t
WHERE JSON_VALUE(t.AdditionalDataJson, '$.priority') = 'High'
ORDER BY t.CreatedAt DESC;
```

### Expand tags using OPENJSON

```sql
SELECT
    t.Id,
    t.Title,
    j.[value] AS Tag
FROM dbo.Tasks t
CROSS APPLY OPENJSON(t.AdditionalDataJson, '$.tags') j
ORDER BY t.Id, j.[value];
```

### Optional example: update one JSON field

```sql
UPDATE dbo.Tasks
SET AdditionalDataJson = JSON_MODIFY(AdditionalDataJson, '$.priority', 'Medium')
WHERE Id = 1;
```

## Delivered scope summary

This solution already includes more than the minimum required scope:

- Edit and delete task endpoints
- Edit and delete user endpoints in the API
- Role and active flag for users
- Richer task filters by priority and tag
- UI for user and task editing
