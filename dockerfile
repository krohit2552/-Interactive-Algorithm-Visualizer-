# Use Node.js slim image
FROM node:22.1.0-slim

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

# Expose Vite default port
EXPOSE 5173

# Run Vite dev server with --host for Docker support
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5174"]
