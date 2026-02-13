# turbo-backend-starter

Production-grade TypeScript monorepo for backend services, workers, and shared packages.

## Stack

- **Runtime:** Node.js >= 18, TypeScript 5.9
- **Monorepo:** Turborepo + pnpm workspaces
- **Queue:** BullMQ (Redis-backed)
- **Cache:** ioredis wrapper with namespace isolation
- **Env:** Zod-validated via @t3-oss/env
- **Lint:** ESLint (shared configs)
- **Formatting:** Prettier

## Structure

```
apps/
  auth-service/     API service (placeholder -- not yet implemented)
  docs/             Next.js documentation site
  worker/           Background job processor (BullMQ)

packages/
  env/              Zod-based env validation (node, react, next)
  eslint-config/    Shared ESLint configs (base, node, next, react)
  logger/           Lightweight contextual logger
  queue/            BullMQ queue + worker + dead-letter abstraction
  redis/            ioredis wrapper with caching, key builder, single-flight
  typescript-config/ Shared tsconfig presets
  ui/               React component library (Tailwind CSS)
```

## Quick start

```bash
# Install dependencies
pnpm install

# Run all apps/packages in dev mode
pnpm dev

# Lint everything
pnpm lint

# Type-check everything
pnpm check-types

# Build everything
pnpm build
```

## Environment variables

Each app has a `.env.example` file. Copy and fill in:

```bash
cp apps/worker/.env.example apps/worker/.env
cp apps/docs/.env.example apps/docs/.env
cp apps/auth-service/.env.example apps/auth-service/.env
```

## Apps

### auth-service

REST API service (not yet implemented). Will handle authentication, user management, and enqueue jobs to the queue. See [apps/auth-service/README.md](apps/auth-service/README.md).

### docs

Next.js documentation site. Will contain full usage documentation for all packages and services. See [apps/docs/README.md](apps/docs/README.md).

### worker

Background job processor. Consumes jobs from BullMQ, processes them with registered handlers, and moves exhausted jobs to a dead-letter queue. See [apps/worker/README.md](apps/worker/README.md).

## Packages

| Package                   | Description                                                   |
| ------------------------- | ------------------------------------------------------------- |
| `@repo/env`               | Zod-validated environment variables for node, react, and next |
| `@repo/eslint-config`     | Shared ESLint configurations                                  |
| `@repo/logger`            | Contextual console logger                                     |
| `@repo/queue`             | BullMQ queue service, worker service, and dead-letter queue   |
| `@repo/redis`             | ioredis wrapper with caching, key builder, single-flight      |
| `@repo/typescript-config` | Shared TypeScript configs                                     |
| `@repo/ui`                | React component library                                       |

## Filter commands

```bash
# Run a specific app/package
pnpm --filter @repo/worker dev
pnpm --filter @repo/redis check-types
pnpm --filter docs dev
```
