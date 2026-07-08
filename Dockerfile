FROM node:22-alpine AS base

ARG USER=node
ENV HOME=/home/$USER

# Alpine doesn't have curl, so add it (used by the healthcheck)
RUN apk --no-cache add curl

# Enable pnpm via corepack (runs as root before USER switch)
RUN corepack enable

USER $USER
WORKDIR $HOME/app

# --- build stage: install deps + bundle ---
FROM base AS build
COPY --chown=$USER:$USER package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY --chown=$USER:$USER . .
RUN pnpm run build

# --- dev (used by docker-compose for local hot-reload via tsx watch) ---
# Reuses the build stage, which has all deps installed and the source copied.
FROM build AS dev
CMD ["pnpm", "run", "dev"]

# --- runtime (default target for production image builds) ---
FROM base AS runtime
COPY --chown=$USER:$USER --from=build $HOME/app/dist ./dist

HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost:3002/api/health || exit 1

EXPOSE 3002

CMD ["node", "dist/server.js"]
