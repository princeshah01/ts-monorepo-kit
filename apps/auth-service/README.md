# auth-service

REST API service for authentication and user management. This app is a **placeholder** — implementation is pending.

## Planned responsibilities

- User registration, login, token refresh
- Session management
- Enqueue background jobs (email, onboarding) via `@repo/queue`
- Cache hot data via `@repo/redis`

## Planned API endpoints

| Method | Path             | Description              |
| ------ | ---------------- | ------------------------ |
| `POST` | `/auth/register` | Register a new user      |
| `POST` | `/auth/login`    | Login and return tokens  |
| `POST` | `/auth/refresh`  | Refresh access token     |
| `POST` | `/auth/logout`   | Invalidate session       |
| `GET`  | `/auth/me`       | Get current user profile |
| `GET`  | `/health`        | Service health check     |

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
