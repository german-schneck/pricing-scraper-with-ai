# Dockerfile for Devoto application
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

ENV MARKETPLACE_NAME=Devoto
ENV MARKETPLACE_COUNTRY=UY
ENV START_URL=https://www.devoto.com.uy

ENV DATABASE_HOST=127.0.0.1
ENV DATABASE_PORT=5432
ENV DATABASE_USERNAME=root
ENV DATABASE_PASSWORD=1234
ENV DATABASE_NAME=scraper-db

# Start the application
CMD ["npx", "ts-node", "--transpile-only", "src/index.ts"]