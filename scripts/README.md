# Learning Journey Scripts

This directory contains various utility scripts for the Learning Journey application, including database backup/restore and path progress management.

## Prerequisites

- Docker and Docker Compose must be installed
- MongoDB container must be running
- The application must be using the default database configuration

## Available Scripts

### Database Management

1. **Backup**: `scripts/backup-db.js` ✅ **Recommended**
2. **Restore**: `scripts/restore-db.js` ✅ **Recommended**
3. **Shell Scripts**: `scripts/backup-db.sh` & `scripts/restore-db.sh` ⚠️ **May have timing issues on Windows**

### Path Progress Management

1. **Update Path Progress**: `scripts/update-path-progress.js` ✅ **Main script for path progress**

## Usage

### Using NPM Scripts (Recommended)

#### Create a Backup

```bash
# Using Node.js script
npm run backup

# Using shell script
npm run backup:sh
```

#### Restore from Backup

```bash
# Using Node.js script
npm run restore <backup-file.zip>

# Using shell script
npm run restore:sh <backup-file.zip>
```

### Direct Script Execution

#### Create a Backup

```bash
# Using Node.js script
node scripts/backup-db.js

# Using shell script
bash scripts/backup-db.sh
# or
./scripts/backup-db.sh
```

#### Restore from Backup

```bash
# Using Node.js script
node scripts/restore-db.js backups/learning-journey-backup-2024-01-15T10-30-00-000Z.zip

# Using shell script
bash scripts/restore-db.sh backups/learning-journey-backup-2024-01-15T10-30-00-000Z.zip
# or
./scripts/restore-db.sh backups/learning-journey-backup-2024-01-15T10-30-00-000Z.zip
```

#### Update Path Progress

```bash
# Update all path progress based on course completion
node scripts/update-path-progress.js
```

## What the Scripts Do

### Backup Process

1. **Check Container Status**: Verifies that the MongoDB container is running
2. **Create Database Dump**: Uses `mongodump` to create a backup of the database
3. **Copy to Host**: Copies the backup from the container to the host system
4. **Create Zip Archive**: Compresses the backup into a zip file with timestamp
5. **Clean Up**: Removes temporary files from both container and host
6. **Report Results**: Shows backup file location, size, and creation time

### Restore Process

1. **Validate Input**: Checks if the backup file exists and is valid
2. **Check Container Status**: Verifies that the MongoDB container is running
3. **Extract Archive**: Extracts the zip file to a temporary directory
4. **Copy to Container**: Copies the extracted backup to the MongoDB container
5. **Drop Existing Database**: Removes the current database (optional)
6. **Restore Database**: Uses `mongorestore` to restore the database
7. **Clean Up**: Removes temporary files from both container and host
8. **Report Results**: Confirms successful restoration

### Path Progress Update Process

1. **Load Environment**: Reads database configuration from .env file or uses fallback
2. **Connect to Database**: Establishes connection to MongoDB
3. **Get All Paths**: Retrieves all learning paths from the database
4. **Process Each Path**: For each path, gets all users with progress records
5. **Recalculate Progress**: For each user, recalculates path completion based on:
   - Required course completion (prioritized)
   - Elective group completion
   - Minimum course requirements
6. **Update Records**: Updates path progress with correct completion status
7. **Report Results**: Shows summary of users checked and updated

## Backup File Location

Backups are stored in the `backups/` directory at the project root. Each backup file is named with a timestamp:

```
backups/
├── learning-journey-backup-2024-01-15T10-30-00-000Z.zip
├── learning-journey-backup-2024-01-16T14-45-30-000Z.zip
└── ...
```

## Configuration

The scripts automatically read the database configuration from your environment files:

1. **Primary**: `.env` file in the project root
2. **Fallback**: `.env.dev` file if `.env` doesn't exist

The scripts parse the `MONGO_URI` environment variable to extract:
- **Database Name**: From the URI path
- **Username**: From the URI credentials
- **Password**: From the URI credentials  
- **Host**: From the URI hostname
- **Port**: From the URI port (defaults to 27000)
- **Authentication Database**: From the `authSource` parameter (defaults to admin)

### Example MONGO_URI format:
```
mongodb://username:password@hostname:port/database?authSource=admin
```

### Environment File Setup:
Create a `.env` file in your project root with:
```bash
MONGO_URI=mongodb://admin:password123@localhost:27000/learning_journey?authSource=admin
```

The scripts will automatically detect and use the correct configuration based on your environment.

## Troubleshooting

### Common Issues

1. **MONGO_URI Not Set**
   ```
   ❌ MONGO_URI environment variable is not set
   ```
   **Solution**: Create a `.env` file in your project root with your MongoDB connection string

2. **Invalid MONGO_URI Format**
   ```
   ❌ Invalid MONGO_URI format
   ```
   **Solution**: Ensure your MONGO_URI follows the format: `mongodb://username:password@host:port/database?authSource=admin`

3. **Container Not Running**
   ```
   ❌ MongoDB container 'learning-journey-mongodb' is not running
   ```
   **Solution**: Start the MongoDB container using `docker-compose up -d mongodb`

4. **Permission Denied**
   ```
   ❌ Permission denied when executing shell scripts
   ```
   **Solution**: Make scripts executable with `chmod +x scripts/*.sh`

5. **Backup File Not Found**
   ```
   ❌ Backup file not found: backups/nonexistent-file.zip
   ```
   **Solution**: Check the backup file path and ensure it exists

6. **Zip Command Not Found**
   ```
   ❌ zip command not found
   ```
   **Solution**: Install zip utility:
   - **Ubuntu/Debian**: `sudo apt-get install zip`
   - **macOS**: `brew install zip`
   - **Windows**: Use Git Bash or install zip tools

### Error Recovery

If a backup or restore operation fails:

1. Check the error message for specific issues
2. Ensure the MongoDB container is running
3. Verify you have sufficient disk space
4. Check file permissions
5. Try running the operation again

## Security Notes

- Backup files contain sensitive database information
- Store backups in a secure location
- Consider encrypting backup files for production use
- Regularly rotate old backup files
- Test restore procedures periodically

## Automation

You can automate these scripts by:

1. **Cron Job** (Linux/macOS):
   ```bash
   # Add to crontab -e
   0 2 * * * cd /path/to/learning-journey && npm run backup
   0 3 * * * cd /path/to/learning-journey && node scripts/update-path-progress.js
   ```

2. **Windows Task Scheduler**: Create scheduled tasks to run the scripts

3. **Docker Compose**: Add services to docker-compose.yml for automated operations

## Support

For issues with these scripts:

1. Check the troubleshooting section above
2. Verify your Docker and MongoDB setup
3. Review the script logs for detailed error messages
4. Ensure you're using the correct backup file format
