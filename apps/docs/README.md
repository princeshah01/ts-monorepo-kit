# docs

Next.js documentation site for the monorepo. This is where full usage documentation for all packages and services will live.

## Environment

```bash
cp .env.example .env
```

See [.env.example](.env.example) for all variables.

## Scripts

```bash
pnpm --filter docs dev          # dev server on port 3000
pnpm --filter docs build        # production build
pnpm --filter docs start        # start production server
pnpm --filter docs lint         # lint
pnpm --filter docs check-types  # type-check
```
