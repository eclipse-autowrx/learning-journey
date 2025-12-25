# Development Guide

This guide provides step-by-step instructions for setting up the development environment.

## Prerequisites

- Node.js 18+
- Docker (for MongoDB)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup MongoDB

Run MongoDB in Docker:

```bash
docker run -d \
  --name learning-journey-mongodb-dev \
  -p 27000:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=learning_journey \
  --restart unless-stopped \
  mongo:7.0
```

This will:
- Create and start a MongoDB container
- Configure MongoDB with default credentials
- Container will be ready in a few seconds



### 3. Configure Environment

Create `.env.local` file:

```bash
# Database Configuration
MONGO_URI=mongodb://admin:password123@localhost:27000/learning_journey?authSource=admin

# Application Configuration
NODE_ENV=development
PORT=3090
NEXT_PUBLIC_BASE_URL=http://localhost:3090

# Media Storage (optional - defaults to public/ if not set)
# MEDIA_STORE_PATH=/opt/learning/media_store
```

### 4. Setup Media Directories

Create media directories and symlinks. Symlinks are not tracked in git, so each developer needs to set them up after cloning.

**Option 1: Use default location (public/ directory)**

```bash
# Create directories if they don't exist
mkdir -p public/images public/files
```

**Option 2: Use external storage location**

If you have `MEDIA_STORE_PATH` set in your `.env.local` (e.g., `/opt/learning/media_store`):

```bash
# Create the storage directories
mkdir -p /opt/learning/media_store/images
mkdir -p /opt/learning/media_store/files

# Remove existing symlinks/directories if they exist
rm -f public/images public/files

# Create symlinks pointing to the storage location
ln -s /opt/learning/media_store/images public/images
ln -s /opt/learning/media_store/files public/files
```

**Note:** Replace `/opt/learning/media_store` with your actual `MEDIA_STORE_PATH` value.

### 5. Migrate Data (Optional)

Populate database with mock data:

```bash
npm run migrate
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3090

## MongoDB Connection Details

- **Host:** localhost:27000
- **Database:** learning_journey
- **Username:** admin
- **Password:** password123
- **Connection String:** `mongodb://admin:password123@localhost:27000/learning_journey?authSource=admin`

## Available Commands

### Essential Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run migrate` - Migrate mock data to database

### MongoDB Management Commands

**Start MongoDB:**
```bash
docker run -d \
  --name learning-journey-mongodb-dev \
  -p 27000:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=learning_journey \
  --restart unless-stopped \
  mongo:7.0
```

**Stop MongoDB:**
```bash
docker stop learning-journey-mongodb-dev
```

**Start MongoDB (if container already exists):**
```bash
docker start learning-journey-mongodb-dev
```

**View MongoDB logs:**
```bash
docker logs -f learning-journey-mongodb-dev
```

**Remove MongoDB container:**
```bash
docker rm -f learning-journey-mongodb-dev
```

### Additional Scripts

For maintenance and one-time tasks, you can run scripts directly from the `scripts/` directory:

**Database Management:**
- `node scripts/backup-db.js` - Backup database
- `node scripts/restore-db.js <backup-file>` - Restore database
- `bash scripts/backup-db.sh` - Backup using shell script
- `bash scripts/restore-db.sh <backup-file>` - Restore using shell script

**Data Migration & Maintenance:**
- `node scripts/migrate-collections.js` - Migrate collections data
- `node scripts/normalize-course-progress.js` - Normalize course progress

**Development Utilities:**
- `node scripts/dev-cache.js` - Manage dev cache
- `node scripts/prewarm-pages.js` - Prewarm pages for faster startup

**Testing:**
- `node --test` - Run tests

## Troubleshooting

### MongoDB Connection Issues

1. Check if MongoDB is running:
   ```bash
   docker ps | grep mongodb
   ```

2. Check MongoDB logs:
   ```bash
   docker logs learning-journey-mongodb-dev
   ```

3. Test MongoDB connection:
   ```bash
   docker exec learning-journey-mongodb-dev mongosh -u admin -p password123 --authenticationDatabase admin
   ```

### Port Already in Use

If port 27000 is already in use, you can change it:

1. Update MongoDB container port mapping
2. Update `MONGO_URI` in `.env.local` to match new port

### Reset Database

To start fresh:

```bash
# Stop and remove MongoDB container
docker rm -f learning-journey-mongodb-dev

# Start MongoDB again
docker run -d \
  --name learning-journey-mongodb-dev \
  -p 27000:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -e MONGO_INITDB_DATABASE=learning_journey \
  --restart unless-stopped \
  mongo:7.0

# Wait a few seconds for MongoDB to start, then migrate data
npm run migrate
```

