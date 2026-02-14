# @repo/logger

Lightweight contextual console logger for the monorepo.

## API

```ts
import { Logger } from "@repo/logger"

const logger = new Logger("MyService")

logger.info("Server started") // [MyService] INFO: Server started
logger.error("Something broke", err) // [MyService] ERROR: Something broke
logger.warn("Deprecated call") // [MyService] WARN: Deprecated call
```

## Methods

| Method                      | Output           |
| --------------------------- | ---------------- |
| `info(message, ...args)`    | `console.log`    |
| `error(message, ...args)`   | `console.error`  |
| `warn(message, ...args)`    | `console.warn`   |
| `warning(message, ...args)` | Alias for `warn` |

## Scripts

```bash
pnpm --filter @repo/logger lint
pnpm --filter @repo/logger check-types
```
