# Production Deployment Guide

This guide covers deploying the application to production using Docker.

## Prerequisites

- Docker and Docker Compose installed on Ubuntu server
- Access to Docker image registry (ghcr.io/eclipse-autowrx/learning-journey:latest)

## Initial Setup

### 1. Create Data Directory

```bash
sudo mkdir -p /opt/learning-journey/data
sudo chown -R $USER:$USER /opt/learning-journey/data
sudo chmod -R 755 /opt/learning-journey/data
```

### 2. Download Deployment Files

Download the deployment files from the latest GitHub release:

```bash
# Create deployment directory
mkdir -p /opt/learning-journey/deploy
cd /opt/learning-journey/deploy

# Download files from latest release (replace vX.X.X with actual version)
RELEASE_VERSION="v1.0.0"  # Update with your release version
wget https://github.com/eclipse-autowrx/learning-journey/releases/download/${RELEASE_VERSION}/docker-compose.prod.yml
wget https://github.com/eclipse-autowrx/learning-journey/releases/download/${RELEASE_VERSION}/env.prod.example
```

### 3. Configure Environment

```bash
cd /opt/learning-journey/deploy
cp env.prod.example .env.prod
# Edit .env.prod with your production settings
```

**Required Environment Variables:**

```bash
DOCKER_IMAGE=ghcr.io/eclipse-autowrx/learning-journey:latest

# MongoDB connection URI (ONLY required MongoDB variable)
MONGO_URI=mongodb://admin:your_secure_password@mongodb:27017/learning_journey?authSource=admin

APP_PORT=3000
MEDIA_STORE_PATH=/app/data
```

**Note:** 
- `MONGO_URI` is the only required MongoDB configuration variable for the application
- Format: `mongodb://username:password@host:port/database?authSource=admin`
- For containerized MongoDB, use `mongodb` as the host (Docker service name)
- For external MongoDB, use the actual hostname/IP address
- MongoDB container uses default credentials (`admin`/`password123`/`27000`) unless you set `MONGO_USERNAME`, `MONGO_PASSWORD`, `MONGO_PORT` in `.env.prod`

### 4. Deploy

```bash
cd /opt/learning-journey/deploy

# Deploy services
docker compose -f docker-compose.prod.yml --env-file .env.prod pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

## Updating Application

```bash
cd /opt/learning-journey/deploy

# Download latest deployment files from GitHub release
RELEASE_VERSION="v1.0.0"  # Update with latest release version
wget -O docker-compose.prod.yml https://github.com/eclipse-autowrx/learning-journey/releases/download/${RELEASE_VERSION}/docker-compose.prod.yml

# Pull latest Docker image
docker compose -f docker-compose.prod.yml --env-file .env.prod pull

# Restart services (data persists automatically)
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

## Management Commands

### View Logs

```bash
cd /opt/learning-journey/deploy
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f
```

### Stop Services

```bash
cd /opt/learning-journey/deploy
docker compose -f docker-compose.prod.yml --env-file .env.prod down
```

### Restart Services

```bash
cd /opt/learning-journey/deploy
docker compose -f docker-compose.prod.yml --env-file .env.prod restart
```

### Check Status

```bash
cd /opt/learning-journey/deploy
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
```

## Data Persistence

All persistent data (certificates, images, files) is stored in `/opt/learning-journey/data` on the host machine. This data persists across container updates and restarts.

### Backup Data

```bash
# Backup data directory
tar -czf /opt/learning-journey/backups/data_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /opt/learning-journey/data .
```

### Restore Data

```bash
# Stop services first
cd /opt/learning-journey/deploy
docker compose -f docker-compose.prod.yml --env-file .env.prod down

# Restore data
tar -xzf /opt/learning-journey/backups/data_backup_YYYYMMDD_HHMMSS.tar.gz -C /opt/learning-journey/data

# Start services
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

## External Nginx Configuration

If using external nginx, configure it to proxy to the app:

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Troubleshooting

### Check Container Status

```bash
docker ps -a | grep learning-journey
```

### View Container Logs

```bash
docker logs learning-journey-app-prod
docker logs learning-journey-mongodb-prod
```

### Verify Data Volume

```bash
ls -la /opt/learning-journey/data
docker exec learning-journey-app-prod ls -la /app/data
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

