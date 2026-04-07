# Frontend

## Run

```bash
npm install
npm start
```

## Important

This project expects the backend API to run on:

```text
https://localhost:7094
```

The frontend uses `/api` and must run with the proxy configuration enabled.

## Available routes

- `/tasks`
- `/tasks/new`
- `/users`
- `/users/new`

## Architecture

- `core` for shell and app-wide layout
- `shared` for reusable UI
- `features/tasks` for task pages, components and API service
- `features/users` for user pages, components and API service
