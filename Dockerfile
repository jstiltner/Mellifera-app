# Use an official Node runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Vite app
RUN npm run build

# Expose the ports the app runs on
EXPOSE 3000 5000

# Command to run the application
CMD ["npm", "start"]