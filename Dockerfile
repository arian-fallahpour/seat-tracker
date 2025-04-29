# Use the official Node.js image from Docker Hub
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy rest of your app
COPY . .

# Tell Docker/Azure that we’ll use port 8080
EXPOSE 8080

# Start your app (change index.js to your entry point if different)
CMD ["node", "server.js"]