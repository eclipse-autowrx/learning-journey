#!/bin/bash

# Database restore script for Learning Journey
# This script restores the MongoDB database from a zip backup file

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

# Function to extract zip archive based on platform
extract_zip_archive() {
    local zip_path="$1"
    local extract_dir="$2"
    
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        # Windows (Git Bash)
        powershell -Command "Expand-Archive -Path '$zip_path' -DestinationPath '$extract_dir' -Force"
    else
        # Unix-like systems
        cd "$extract_dir" && unzip "$zip_path"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 <backup-file.zip>"
    echo "Example: $0 backups/learning-journey-backup-2024-01-15T10-30-00-000Z.zip"
    echo ""
    echo "Available backup files:"
    if [ -d "$BACKUP_DIR" ]; then
        ls -la "$BACKUP_DIR"/*.zip 2>/dev/null || echo "No backup files found in $BACKUP_DIR"
    else
        echo "Backup directory $BACKUP_DIR does not exist"
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

# Check if backup file is provided
if [ $# -eq 0 ]; then
    print_error "❌ Please provide the path to the backup zip file"
    echo ""
    show_usage
    exit 1
fi

BACKUP_ZIP_PATH="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_ZIP_PATH" ]; then
    print_error "❌ Backup file not found: $BACKUP_ZIP_PATH"
    echo ""
    show_usage
    exit 1
fi

print_status "🚀 Starting database restore..."
print_status "📁 Restoring from: $BACKUP_ZIP_PATH"
print_status "🗄️ Database: $DB_NAME"
print_status "🔗 Host: $DB_HOST:$DB_PORT"
print_status "🐳 Container: $CONTAINER_NAME"

# Extract zip file
print_status "📦 Extracting backup archive..."
EXTRACT_DIR="$BACKUP_DIR/temp-restore"

# Clean up any existing temp directory
if [ -d "$EXTRACT_DIR" ]; then
    rm -rf "$EXTRACT_DIR"
fi

# Create temp directory and extract
mkdir -p "$EXTRACT_DIR"
extract_zip_archive "$BACKUP_ZIP_PATH" "$EXTRACT_DIR"
print_success "✅ Backup archive extracted"

# Find the extracted backup directory
EXTRACTED_ITEMS=($(ls -A "$EXTRACT_DIR"))
if [ ${#EXTRACTED_ITEMS[@]} -eq 0 ]; then
    print_error "❌ No files found in the backup archive"
    exit 1
fi

BACKUP_DIR_NAME="${EXTRACTED_ITEMS[0]}"  # Should be the backup directory
EXTRACTED_BACKUP_PATH="$EXTRACT_DIR/$BACKUP_DIR_NAME"

# Copy backup to container
print_status "📋 Copying backup to container..."
docker cp "$EXTRACTED_BACKUP_PATH" "$CONTAINER_NAME:/tmp/"
print_success "✅ Backup copied to container"

# Drop existing database
print_status "🗑️ Dropping existing database..."
docker exec "$CONTAINER_NAME" mongosh \
    --username "$DB_USER" \
    --password "$DB_PASSWORD" \
    --authenticationDatabase "$AUTH_SOURCE" \
    --eval "use $DB_NAME; db.dropDatabase();"
print_success "✅ Existing database dropped"

# Restore database
print_status "🔄 Restoring database..."
docker exec "$CONTAINER_NAME" mongorestore \
    --db "$DB_NAME" \
    --username "$DB_USER" \
    --password "$DB_PASSWORD" \
    --authenticationDatabase "$AUTH_SOURCE" \
    "/tmp/$BACKUP_DIR_NAME/$DB_NAME"
print_success "✅ Database restored successfully"

# Clean up temporary files
print_status "🧹 Cleaning up temporary files..."
docker exec "$CONTAINER_NAME" rm -rf "/tmp/$BACKUP_DIR_NAME"
rm -rf "$EXTRACT_DIR"
print_success "✅ Temporary files cleaned up"

print_success "🎉 Database restore completed successfully!"
print_success "⏰ Restored at: $(date)"
print_warning "💡 You may need to restart your application to see the changes."
