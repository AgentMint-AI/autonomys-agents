FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
# Remove --frozen-lockfile flag to allow yarn to update the lockfile
RUN yarn install

# Copy source code
COPY . .

# Install type definitions explicitly
RUN yarn add -D @types/express @types/cors

# Build the application
RUN yarn build

# Expose the port your app runs on
EXPOSE 3001

# Start the API in development mode
CMD ["yarn", "api:dev"] 