# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package installation files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy only the necessary files from the builder stage
# For React Router v7 with @react-router/serve, we need build output and node_modules
# Alternatively, we can omit node_modules if we use a standalone build, but for safety:
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Install only production dependencies to keep the image small
RUN npm ci --omit=dev

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
