FROM nginx:1.25-alpine

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom configuration
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/

# Create necessary directories
RUN mkdir -p /app/staticfiles /app/mediafiles

# Expose ports
EXPOSE 80 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 