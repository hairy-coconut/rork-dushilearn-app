FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies using npm install
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build:web

# Expose port
EXPOSE $PORT

# Start the server
CMD ["node", "server-simple.js"]