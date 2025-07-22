# Use Node.js 22 with Debian Buster Slim
FROM node:22-bookworm-slim

# Set working directory
WORKDIR /app

# Copy package.json files first for better layer caching
COPY rtmediaproxy_frontend/package.json rtmediaproxy_frontend/package-lock.json* ./frontend/
COPY rtmediaproxy_server/package.json rtmediaproxy_server/package-lock.json* ./server/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci --only=production

# Install server dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Copy frontend source code
WORKDIR /app
COPY rtmediaproxy_frontend ./frontend/

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Copy server source code
WORKDIR /app
COPY rtmediaproxy_server ./server/

# Create frontend dist directory in the expected location for the server
RUN mkdir -p /app/server/frontend_dist
RUN cp -r /app/frontend/dist/* /app/server/frontend_dist/

# Set working directory to server
WORKDIR /app/server

# Expose port
EXPOSE 8080

# Set environment variable for frontend root
ENV FRONTEND_ROOT=/app/server/frontend_dist

# Start the server
CMD ["node", "index.js"]
