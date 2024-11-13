FROM node:22-alpine AS base

# Alpine doesn't have curl, so add it
RUN apk --no-cache add curl

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and lock file to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Next.js app
RUN npm run build

HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD curl -f http://localhost/api/health || exit 1

ENV PORT=80

EXPOSE 80

# Start the Next.js app in production mode
CMD ["npm", "run", "start"]
