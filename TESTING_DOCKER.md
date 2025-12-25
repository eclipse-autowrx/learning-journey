# Testing Docker Image Locally

This guide shows how to test the Docker image locally using the exact same deployment setup as production, but with a locally built image.

## Step 1: Build the Docker Image Locally

```bash
docker build -t learning-journey:local .
```

## Step 2: Setup Test Environment

Copy the deploy directory to `.docker-test-data`:

```bash
rm -rf .docker-test-data
mkdir -p .docker-test-data
cp -r deploy/* .docker-test-data/
cd .docker-test-data
```

Create `.env.test` from the example:

```bash
cp env.prod.example .env.test
```

Update `.env.test` to use local image and test settings:

```bash
# Use local Docker image instead of GHCR
sed -i 's|DOCKER_IMAGE=ghcr.io/eclipse-autowrx/learning-journey:latest|DOCKER_IMAGE=learning-journey:local|' .env.test

# Use default password for local testing
sed -i 's|MONGO_URI=mongodb://admin:your_secure_password_here@mongodb:27017/learning_journey?authSource=admin|MONGO_URI=mongodb://admin:password123@mongodb:27017/learning_journey?authSource=admin|' .env.test

# Use localhost for local testing
sed -i 's|NEXT_PUBLIC_BASE_URL=https://your-domain.com:3090|NEXT_PUBLIC_BASE_URL=http://localhost:3090|' .env.test
```

Update the bind mount path in `docker-compose.prod.yml` to use the absolute path:

```bash
# Update the data directory path to be absolute
DATA_DIR=$(pwd -P)/data
sed -i "s|device: /opt/learning-journey/data|device: ${DATA_DIR}|" docker-compose.prod.yml

# Create the data directory
mkdir -p data
```

## Step 3: Start the Services

From the `.docker-test-data` directory:

```bash
cd .docker-test-data
docker compose -f docker-compose.prod.yml --env-file .env.test up -d
```

## Step 4: Check Logs

```bash
docker compose -f docker-compose.prod.yml --env-file .env.test logs -f
```

## Step 5: Access the Application

- Application: http://localhost:3090
- Health check: http://localhost:3090/api/health
- MongoDB: localhost:27000 (if `MONGO_PORT` is set to 27000 in `.env.test`)

## Step 6: Stop Services

```bash
cd .docker-test-data
docker compose -f docker-compose.prod.yml --env-file .env.test down
```

## Step 7: Cleanup (Optional)

To remove containers and volumes:

```bash
cd .docker-test-data
docker compose -f docker-compose.prod.yml --env-file .env.test down -v

# Remove test data directory (optional)
rm -rf ../.docker-test-data
```

## Quick Test Script

You can create a script to automate all of this:

```bash
#!/bin/bash
# test-docker-local.sh

set -e

echo "Building Docker image..."
docker build -t learning-journey:local .

echo "Setting up test environment..."
rm -rf .docker-test-data
mkdir -p .docker-test-data
cp -r deploy/* .docker-test-data/
cd .docker-test-data

# Create .env.test
cp env.prod.example .env.test
sed -i 's|DOCKER_IMAGE=ghcr.io/eclipse-autowrx/learning-journey:latest|DOCKER_IMAGE=learning-journey:local|' .env.test
sed -i 's|MONGO_URI=mongodb://admin:your_secure_password_here@mongodb:27017/learning_journey?authSource=admin|MONGO_URI=mongodb://admin:password123@mongodb:27017/learning_journey?authSource=admin|' .env.test
sed -i 's|NEXT_PUBLIC_BASE_URL=https://your-domain.com:3090|NEXT_PUBLIC_BASE_URL=http://localhost:3090|' .env.test

# Update bind mount path
DATA_DIR=$(pwd -P)/data
sed -i "s|device: /opt/learning-journey/data|device: ${DATA_DIR}|" docker-compose.prod.yml

# Create data directory
mkdir -p data

# Start services
echo "Starting services..."
docker compose -f docker-compose.prod.yml --env-file .env.test up -d

echo ""
echo "✅ Services started!"
echo "   Application: http://localhost:3090"
echo "   Health check: http://localhost:3090/api/health"
echo ""
echo "View logs: cd .docker-test-data && docker compose -f docker-compose.prod.yml --env-file .env.test logs -f"
echo "Stop services: cd .docker-test-data && docker compose -f docker-compose.prod.yml --env-file .env.test down"
```

Save this as `test-docker-local.sh`, make it executable (`chmod +x test-docker-local.sh`), and run it:

```bash
./test-docker-local.sh
```
