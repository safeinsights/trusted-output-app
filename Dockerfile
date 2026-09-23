FROM node:22-alpine AS base


ARG USER=node
ENV HOME /home/$USER

# Alpine doesn't have curl, so add it
RUN apk --no-cache add curl

# Enable pnpm via corepack (runs as root before USER switch)
RUN corepack enable

# Set the working directory inside the container
USER $USER
WORKDIR $HOME/app

# Copy the package.json, lockfile, and workspace settings to install dependencies
COPY --chown=$USER:$USER package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application files (includes the vendor/encryption submodule)
COPY --chown=$USER:$USER . .

# Bundle the app (and the raw-TS si-encryption dependency) into a self-contained dist/server.mjs
RUN pnpm run build

HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost:3002/api/health || exit 1

EXPOSE 3002

# Start the bundled app in production mode
CMD ["pnpm", "run", "start"]
