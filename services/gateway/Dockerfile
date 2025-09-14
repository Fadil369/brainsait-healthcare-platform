FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Create nginx user and set permissions
RUN addgroup -g 1001 brainsait && \
    adduser -D -s /bin/sh -u 1001 -G brainsait brainsait && \
    chown -R brainsait:brainsait /var/cache/nginx && \
    chown -R brainsait:brainsait /var/log/nginx && \
    chown -R brainsait:brainsait /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R brainsait:brainsait /var/run/nginx.pid

USER brainsait

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
