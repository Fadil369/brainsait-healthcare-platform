# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S brainsait && \
    adduser -S brainsait -u 1001 -G brainsait

# Copy built application from builder stage
COPY --from=builder --chown=brainsait:brainsait /app/.next/standalone ./
COPY --from=builder --chown=brainsait:brainsait /app/.next/static ./.next/static
COPY --from=builder --chown=brainsait:brainsait /app/public ./public

USER brainsait

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

EXPOSE 3000

CMD ["node", "server.js"]
