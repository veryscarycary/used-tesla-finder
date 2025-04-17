# Use Node.js base image
FROM node:18-bullseye

# Install system dependencies
RUN apt-get update && apt-get install -y \
  wget \
  curl \
  gnupg \
  unzip \
  chromium \
  chromium-driver \
  fonts-liberation \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libnss3 \
  libatk-bridge2.0-0 \
  libgtk-3-0 \
  && rm -rf /var/lib/apt/lists/*

# Set environment variables (optional but good for Puppeteer or similar)
ENV CHROME_BIN=/usr/bin/chromium \
    CHROMEDRIVER_BIN=/usr/bin/chromedriver

# Set the working directory
WORKDIR /app

# Copy your app code
COPY . .

# Install Node dependencies
RUN npm install

# Command to run your app
CMD ["npm", "start"]
