# Path Progress Migration Scripts

This directory contains scripts to fix path progress issues that occurred before the quiz completion fix was implemented.

## Problem

Users who completed courses before the path progress update fix don't have their path progress properly calculated. This results in:
- Path statistics showing 0 certified learners even when users have completed all courses
- Certificate icons not unlocking properly
- Inconsistent progress tracking

## Solution

Three migration scripts are provided to fix this issue:

### 1. Complete Migration (`migrate-path-progress.js`)

**Purpose**: Recalculates path progress for ALL users and ALL paths.

**Usage**:
```bash
# Run directly
node scripts/migrate-path-progress.js

# Or call the API endpoint
curl -X POST http://localhost:3000/api/admin/migrate-path-progress
```

**What it does**:
- Finds all paths in the system
- For each path, finds all users with path progress
- Recalculates path progress for each user based on their course completion
- Updates path progress records with correct states

**When to use**: 
- First time running the migration
- When you want to ensure all path progress is correct
- After major changes to path completion logic

### 2. Targeted Fix (`fix-incomplete-path-progress.js`)

**Purpose**: Only fixes users who have completed all courses but path progress is not marked as completed.

**Usage**:
```bash
node scripts/fix-incomplete-path-progress.js
```

**What it does**:
- Identifies users with completed courses but incomplete path progress
- Only updates these specific cases
- More efficient than full migration
- Provides detailed report of issues found and fixed

**When to use**:
- After the initial migration
- For ongoing maintenance
- When you suspect specific users are affected

### 3. Background Check (`check-path-progress.js`)

**Purpose**: Periodic check to ensure path progress stays up to date.

**Usage**:
```bash
# Run once
node scripts/check-path-progress.js

# Set up cron job (every 6 hours)
0 */6 * * * cd /path/to/your/project && node scripts/check-path-progress.js
```

**What it does**:
- Checks all path progress records
- Updates any that are out of sync
- Provides summary statistics
- Designed for automated/scheduled execution

**When to use**:
- Set up as a cron job for ongoing maintenance
- After deploying new features that might affect progress
- For monitoring and health checks

## API Endpoint

### POST `/api/admin/migrate-path-progress`

Triggers the complete migration via API.

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <token> (if required)
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total_paths": 5,
    "total_users_updated": 12,
    "total_errors": 0,
    "migration_time": "2025-01-08T10:30:00.000Z",
    "duration_ms": 1500
  }
}
```

## Recommended Migration Strategy

1. **Test First**: Run the test script to verify everything is working
   ```bash
   node scripts/test-migration.js
   ```

2. **Initial Fix**: Run the complete migration script
   ```bash
   node scripts/migrate-path-progress.js
   ```

3. **Verify Results**: Check that path statistics now show correct certified learner counts

4. **Set Up Monitoring**: Add the background check script to your cron jobs
   ```bash
   # Add to crontab
   0 0 * * * cd /path/to/your/project && node scripts/check-path-progress.js
   ```

5. **Ongoing Maintenance**: Use the targeted fix script when needed
   ```bash
   node scripts/fix-incomplete-path-progress.js
   ```

## Monitoring

All scripts provide detailed console output including:
- Number of paths processed
- Number of users updated
- Any errors encountered
- Summary statistics

Check your application logs after running migrations to verify success.

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure MongoDB is running
   - Check connection string in environment variables

2. **Permission Errors**
   - Ensure the script has read/write access to the database
   - Check user permissions for the API endpoint

3. **Memory Issues**
   - For large datasets, consider running migrations during off-peak hours
   - Monitor memory usage during execution

### Logs

All scripts log their progress to the console. For production deployments, consider redirecting output to log files:

```bash
node scripts/migrate-path-progress.js >> /var/log/path-progress-migration.log 2>&1
```

## Security Notes

- The API endpoint requires authentication
- Consider adding admin permission checks
- Run migrations during maintenance windows
- Backup your database before running migrations

## Performance Impact

- **Complete Migration**: May take several minutes for large datasets
- **Targeted Fix**: Usually completes in seconds
- **Background Check**: Minimal impact, designed for frequent execution

The scripts are designed to be safe and won't cause data loss, but always backup your database before running migrations.
