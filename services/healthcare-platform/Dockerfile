FROM nginx:alpine

COPY index.html /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf

RUN addgroup -g 1001 brainsait && \
    adduser -D -s /bin/sh -u 1001 -G brainsait brainsait && \
    mkdir -p /tmp/nginx && \
    chown -R brainsait:brainsait /tmp /var/cache/nginx /var/log/nginx /etc/nginx /usr/share/nginx/html && \
    touch /tmp/nginx.pid && \
    chown brainsait:brainsait /tmp/nginx.pid

USER brainsait
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
