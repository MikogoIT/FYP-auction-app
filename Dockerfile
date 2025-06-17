# Stage 1: Final image
FROM node:24.2.0-alpine3.22
WORKDIR /app

# Copy only the necessary backend files
COPY backend/package.json ./backend/
RUN npm install --prefix backend

# Copy backend source
COPY backend ./backend

# Copy built frontend artifacts into backend's public serving folder
COPY frontend/dist ./frontend/dist

# Expose port and start the server
EXPOSE 8080
CMD ["node", "backend/server.js"]

# # Run tail to keep the container alive for testing
# CMD ["tail", "-f", "/dev/null"]
