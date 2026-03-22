#!/bin/sh
set -e

# Remove app/package-level node_modules from host bind mount
# (they contain Windows junctions that don't work in Linux)
rm -rf /app/apps/*/node_modules /app/packages/*/node_modules

# In pnpm hoisted mode, workspace packages are not symlinked to root node_modules automatically.
# We manually symlink them so that 'tsx' and Node can resolve @repo/* imports.
mkdir -p /app/node_modules/@repo
for pkg in /app/packages/*; do
  if [ -d "$pkg" ]; then
    ln -s "$pkg" "/app/node_modules/@repo/$(basename "$pkg")" || true
  fi
done

exec "$@"
