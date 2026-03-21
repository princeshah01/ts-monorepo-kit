# auth-service

REST API service for authentication and user management.

This service now follows a strict layered architecture:

- `routes` -> route registration + route-level validators
- `controllers` -> HTTP request/response orchestration
- `services` -> business logic and data operations
- `validators` -> Zod schemas grouped by API domain
- `middlewares` -> auth guard, validation middleware, global error handling

Validation is executed at route level before controller methods run. Invalid payloads are forwarded to the global error handler.

## Responsibilities

- User registration, login, token refresh, logout, profile lookup
- User CRUD management endpoints
- Access token guard for protected routes
- Consistent global error response format

## API endpoints

| Method   | Path                    | Description                         |
| -------- | ----------------------- | ----------------------------------- |
| `GET`    | `/health`               | Service health check                |
| `POST`   | `/api/v1/auth/register` | Register a new user                 |
| `POST`   | `/api/v1/auth/login`    | Login and return access/refresh     |
| `POST`   | `/api/v1/auth/refresh`  | Rotate refresh and issue new tokens |
| `POST`   | `/api/v1/auth/logout`   | Revoke refresh session              |
| `GET`    | `/api/v1/auth/me`       | Get current authenticated profile   |
| `GET`    | `/api/v1/users`         | List users (auth required)          |
| `GET`    | `/api/v1/users/:userId` | Get one user (auth required)        |
| `POST`   | `/api/v1/users`         | Create user (auth required)         |
| `PATCH`  | `/api/v1/users/:userId` | Update user (auth required)         |
| `DELETE` | `/api/v1/users/:userId` | Delete user (auth required)         |

## Notes

- A default seeded admin is available for local development:
  - email: `admin@local.dev`
  - password: `admin1234`
- Tokens are in-memory for now (suitable for dev only).

## Environment

Copy the example and fill in values:

```bash
cp .env.example .env
```

See [.env.example](.env.example) for all variables.

## Scripts

```bash
pnpm --filter auth-service dev
pnpm --filter auth-service build
pnpm --filter auth-service lint
pnpm --filter auth-service check-types
```
