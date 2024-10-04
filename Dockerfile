## Stage 1: Build the Next.js app
#FROM node:21-alpine AS builder
#WORKDIR /app
#
## Install dependencies
#COPY package*.json ./
#RUN npm install
#
## Copy the rest of the application code
#COPY . .
#
## Build the Next.js app
#RUN npm run build
#
## Stage 2: Prepare the app for production (Lambda-friendly)
#FROM public.ecr.aws/lambda/nodejs:21
#WORKDIR /var/task
#
## Copy the build output from the previous stage
#COPY --from=builder /app ./
#
## Expose the Next.js app through the Lambda handler
#CMD ["npm", "run", "start-lambda"]
