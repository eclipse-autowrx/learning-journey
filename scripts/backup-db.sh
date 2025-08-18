#!/bin/bash

# Database backup script for Learning Journey
# This script creates a backup of the MongoDB database and saves it as a zip file

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# Function to parse MONGO_URI
parse_mongo_uri() {
    local mongo_uri="$1"
    
    if [ -z "$mongo_uri" ]; then
        print_error "❌ MONGO_URI environment variable is not set"
        exit 1
    fi
    
    # Extract components using regex
    if [[ $mongo_uri =~ mongodb://([^:]+):([^@]+)@([^:]+):([^/]+)/([^?]+)(.*) ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASSWORD="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
        
        # Extract authSource from query parameters
        if [[ "${BASH_REMATCH[6]}" =~ authSource=([^&]+) ]]; then
            AUTH_SOURCE="${BASH_REMATCH[1]}"
        else
            AUTH_SOURCE="admin"
        fi
    else
        print_error "❌ Invalid MONGO_URI format"
        exit 1
    fi
}

# Function to find MongoDB container
find_mongo_container() {
    local possible_names=("learning-journey-mongodb" "learning-journey-mongodb-dev" "learning-journey-mongodb-prod")
    
    for name in "${possible_names[@]}"; do
        if docker ps --filter "name=${name}" --format "{{.Names}}" | grep -q "^${name}$"; then
            echo "$name"
            return 0
        fi
    done
    
    # If no exact match, try to find any container with 'mongodb' in the name
    local container=$(docker ps --filter "name=mongodb" --format "{{.Names}}" | head -n 1)
    if [ -n "$container" ]; then
        echo "$container"
        return 0
    fi
    
    print_error "❌ No MongoDB container found. Please ensure MongoDB is running."
    exit 1
}

# Function to create zip archive based on platform
create_zip_archive() {
    local source_path="$1"
    local zip_path="$2"
    
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        # Windows (Git Bash)
        powershell -Command "Compress-Archive -Path '$source_path' -DestinationPath '$zip_path' -Force"
    else
        # Unix-like systems
        cd "$(dirname "$source_path")" && zip -r "$(basename "$zip_path")" "$(basename "$source_path")"
    fi
}

# Load environment variables
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Try to load .env file
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
elif [ -f "$PROJECT_ROOT/.env.dev" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env.dev" | xargs)
else
    print_warning "⚠️ No .env file found, using default values"
fi

# Parse MONGO_URI
parse_mongo_uri "$MONGO_URI"

# Find MongoDB container
CONTAINER_NAME=$(find_mongo_container)

# Configuration
BACKUP_DIR="$PROJECT_ROOT/backups"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp for backup filename
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%S-000Z")
BACKUP_FILENAME="learning-journey-backup-$TIMESTAMP"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILENAME"
ZIP_FILE_PATH="$BACKUP_DIR/$BACKUP_FILENAME.zip"

print_status "🚀 Starting database backup..."
print_status "📁 Backup will be saved to: $BACKUP_PATH"
print_status "🗄️ Database: $DB_NAME"
print_status "🔗 Host: $DB_HOST:$DB_PORT"
print_status "🐳 Container: $CONTAINER_NAME"

# Create backup using mongodump
print_status "📦 Creating database backup..."
docker exec "$CONTAINER_NAME" mongodump \
    --db "$DB_NAME" \
    --username "$DB_USER" \
    --password "$DB_PASSWORD" \
    --authenticationDatabase "$AUTH_SOURCE" \
    --out "/tmp/$BACKUP_FILENAME"

print_success "✅ Database dump created successfully"

# Copy backup from container to host
print_status "📋 Copying backup from container to host..."
docker cp "$CONTAINER_NAME:/tmp/$BACKUP_FILENAME" "$BACKUP_PATH"
print_success "✅ Backup copied to host"

# Create zip file
print_status "🗜️ Creating zip archive..."
create_zip_archive "$BACKUP_PATH" "$ZIP_FILE_PATH"
print_success "✅ Zip archive created"

# Clean up temporary files
print_status "🧹 Cleaning up temporary files..."
docker exec "$CONTAINER_NAME" rm -rf "/tmp/$BACKUP_FILENAME"
rm -rf "$BACKUP_PATH"

# Get file size
FILE_SIZE=$(du -h "$ZIP_FILE_PATH" | cut -f1)

print_success "🎉 Backup completed successfully!"
print_success "📄 Backup file: $ZIP_FILE_PATH"
print_success "📊 File size: $FILE_SIZE"
print_success "⏰ Created at: $(date)"
