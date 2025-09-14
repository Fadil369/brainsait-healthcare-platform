FROM cloudflare/cloudflared:latest

# Copy tunnel configuration and credentials with proper ownership
COPY --chown=65532:65532 config.yml /etc/cloudflared/config.yml
COPY --chown=65532:65532 bb538100-d967-49fa-8839-d1f6ccc9ee48.json /etc/cloudflared/bb538100-d967-49fa-8839-d1f6ccc9ee48.json

# Run tunnel
CMD ["tunnel", "--config", "/etc/cloudflared/config.yml", "run"]