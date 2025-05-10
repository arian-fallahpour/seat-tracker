# Use official Node 22 Alpine-based image
FROM node:22-alpine

# Set working directory in the container
WORKDIR /app

# Copy dependency files and install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of your app code
COPY . .

# Declare the port your app listens on
EXPOSE 8080

# Start the app (change index.js to your entry file if needed)
CMD ["node", "index.js"]