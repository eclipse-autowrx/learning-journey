# Use the official Node.js image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install system dependencies (curl for prewarm script)
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js dependencies including optional dependencies (needed for sharp native modules)
RUN npm install --include=optional

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Copy scripts directory to standalone build (needed for prewarm script)
# The standalone build only includes necessary files, so we need to copy scripts manually
RUN cp -r scripts .next/standalone/scripts

# Copy static files to standalone build (required for serving static assets)
# Next.js standalone mode doesn't automatically include .next/static
RUN cp -r .next/static .next/standalone/.next/static

# Copy public directory to standalone build (for static public assets)
RUN cp -r public .next/standalone/public

# Fix symlinks in standalone build to point to MEDIA_STORE_PATH
# Remove broken symlinks and create new ones pointing to /app/data
# RUN ln -sf /app/data/images /app/.next/standalone/public/images && \
#     ln -sf /app/data/files /app/.next/standalone/public/files && \
#     ln -sf /app/data/certificates /app/.next/standalone/public/certificates || true


# Expose the application port
EXPOSE 3000

# Command to run the application with prewarmed pages
CMD ["npm", "run", "start:prewarmed"]
