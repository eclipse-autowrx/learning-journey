# Learning Journey - Setup Guide

This guide will help you set up the Learning Journey application with separate configurations for development and production.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)

## Development Setup

### Quick Start (Recommended)

1. **Run the development setup script:**
   ```bash
   npm run setup:dev
   ```
   This will:
   - Check Docker installation
   - Create `.env.dev` file
   - Start MongoDB and MongoDB Express
   - Migrate mock data to the database

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the services:**
   - **Next.js App:** http://localhost:3000
   - **MongoDB Express (Admin):** http://localhost:8081
     - Username: `admin`
     - Password: `password123`

### Manual Development Setup

1. **Start development services:**
   ```bash
   npm run docker:dev:up
   ```

2. **Wait for MongoDB to be ready, then migrate data:**
   ```bash
   npm run migrate
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Production Setup

### Quick Start

1. **Run the production setup script:**
   ```bash
   npm run setup:prod
   ```
   This will:
   - Check Docker installation
   - Create `.env.prod` file from template
   - Build the Next.js application
   - Start all production services
   - Migrate data to the database

2. **Access the application:**
   - **Application:** http://localhost:3000
   - **MongoDB Express (if enabled):** http://localhost:8081

### Manual Production Setup

1. **Copy and configure environment file:**
   ```bash
   cp env.prod.example .env.prod
   # Edit .env.prod with your production settings
   ```

2. **Add SSL certificates (optional):**
   ```bash
   mkdir -p nginx/ssl
   # Add your SSL certificates:
   # - nginx/ssl/cert.pem
   # - nginx/ssl/key.pem
   ```

3. **Start production services:**
   ```bash
   npm run docker:prod:up
   ```

4. **Start with additional services:**
   ```bash
   npm run docker:prod:admin    # With MongoDB Express
   npm run docker:prod:nginx    # With Nginx
   npm run docker:prod:full     # With all services
   ```

## Services

### Development Services
- **MongoDB:** Port 27000, Database: learning_journey
- **MongoDB Express:** Port 8081, Admin UI
- **Next.js App:** Run locally with `npm run dev`

### Production Services
- **MongoDB:** Port 27000, Database: learning_journey
- **MongoDB Express:** Port 8081 (optional, with admin profile)
- **Next.js App:** Port 3000, Production build
- **Nginx:** Port 80/443 (optional, with nginx profile)

## Environment Variables

### Development
Create a `.env.dev` file:
```env
MONGO_URI=mongodb://admin:password123@localhost:27000/learning_journey?authSource=admin
NODE_ENV=development
PORT=3000
```

### Production
Create a `.env.prod` file (see `env.prod.example`):
```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password
NODE_ENV=production
APP_PORT=3000
# ... other production settings
```

## Available Scripts

### Development
- `npm run setup:dev` - Automated development setup
- `npm run docker:dev:up` - Start development services
- `npm run docker:dev:down` - Stop development services
- `npm run docker:dev:logs` - View development logs

### Production
- `npm run setup:prod` - Automated production setup
- `npm run docker:prod:up` - Start production services
- `npm run docker:prod:down` - Stop production services
- `npm run docker:prod:logs` - View production logs
- `npm run docker:prod:admin` - Start with MongoDB Express
- `npm run docker:prod:nginx` - Start with Nginx
- `npm run docker:prod:full` - Start with all services

### General
- `npm run migrate` - Migrate mock data to database
- `npm run dev` - Start development server
- `npm run build` - Build for production

## Data Migration

The migration script will:
1. Connect to the MongoDB database
2. Clear any existing data
3. Import all mock data from `src/lib/mock_data/`
4. Create proper relationships between paths, courses, and lessons
5. Set up indexes for optimal performance

## API Endpoints

The application now supports both database and mock data:

### Paths
- `GET /api/paths` - Get all paths
- `GET /api/paths/[slug]` - Get path by slug
- `POST /api/paths` - Create new path
- `PUT /api/paths/[slug]` - Update path
- `DELETE /api/paths/[slug]` - Delete path

### Courses
- `GET /api/courses/[slug]` - Get course by slug
- `PUT /api/courses/[slug]` - Update course
- `DELETE /api/courses/[slug]` - Delete course

## Fallback Strategy

The API endpoints are designed to:
1. First try to fetch data from the MongoDB database
2. If no data is found or database is unavailable, fallback to mock data
3. This ensures the application works even without a database connection

## Troubleshooting

### MongoDB Connection Issues
1. Check if MongoDB container is running: `docker ps`
2. View MongoDB logs: `docker-compose logs mongodb`
3. Ensure ports are not in use: `netstat -an | grep 27000`

### Migration Issues
1. Ensure MongoDB is fully started before running migration
2. Check migration logs for specific errors
3. If migration fails, you can still use mock data

### Application Issues
1. Check application logs: `docker-compose logs app`
2. Ensure environment variables are set correctly
3. Restart services: `docker-compose restart`

## Development

For local development without Docker:
1. Install MongoDB locally or use MongoDB Atlas
2. Set `MONGO_URI` to your MongoDB connection string
3. Run `npm run migrate` to populate the database
4. Run `npm run dev` to start the development server

## Data Structure

The application uses the following collections:
- **paths** - Learning paths with course references
- **courses** - Courses with lesson references
- **lessons** - Individual lessons with content
- **courseprogresses** - User progress tracking

All collections include timestamps and proper indexing for optimal performance.
