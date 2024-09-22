# Stage 1: Build the React application
FROM node:18-alpine as client-builder

WORKDIR /app/client

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the client application code
COPY . .

# Build the Vite app
RUN npm run build

# Stage 2: Set up the server
FROM node:18-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy the server code
COPY server ./server

# Copy the built client files from the previous stage
COPY --from=client-builder /app/client/dist ./client/dist

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]