# Use an official Node.js runtime as a parent image
FROM node:lts

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the application's port (change if needed)
EXPOSE 1055

# Set environment variables (optional, can be overridden in docker-compose)
ENV NODE_ENV=development

# Command to start the app
CMD ["node", "app.js"]
