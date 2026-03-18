FROM node:20-alpine

ENV NODE_ENV=development

RUN apk add --no-cache libc6-compat

# enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

COPY . .

RUN pnpm install

CMD ["pnpm", "dev"]