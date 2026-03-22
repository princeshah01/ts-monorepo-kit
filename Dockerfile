FROM node:20-alpine

ENV NODE_ENV=development

RUN apk add --no-cache libc6-compat

# enable pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

COPY . .

# Use hoisted node-linker in Docker so all deps go to root node_modules.
# This avoids symlink issues when host bind mount has Windows junctions.
RUN echo "node-linker=hoisted" > ~/.npmrc
RUN pnpm install

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pnpm", "dev"]