#!/usr/bin/env node

// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import os from 'os';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  // Try .env.dev if .env doesn't exist
  const envDevPath = path.join(__dirname, '..', '.env.dev');
  if (fs.existsSync(envDevPath)) {
    dotenv.config({ path: envDevPath });
  }
}

// Parse MONGO_URI to extract connection details
function parseMongoUri(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not set');
  }

  try {
    const url = new URL(mongoUri);
    const dbName = url.pathname.substring(1); // Remove leading slash
    
    return {
      host: url.hostname,
      port: url.port || '27000',
      username: url.username,
      password: url.password,
      database: dbName,
      authSource: url.searchParams.get('authSource') || 'admin'
    };
  } catch (error) {
    throw new Error(`Invalid MONGO_URI format: ${error.message}`);
  }
}

// Find the correct MongoDB container name
async function findMongoContainer() {
  const possibleNames = [
    'learning-journey-mongodb',
    'learning-journey-mongodb-dev',
    'learning-journey-mongodb-prod'
  ];

  for (const name of possibleNames) {
    try {
      const { stdout } = await execAsync(`docker ps --filter "name=${name}" --format "{{.Names}}"`);
      if (stdout.trim() === name) {
        return name;
      }
    } catch (error) {
      // Container not found, continue to next
    }
  }

  // If no exact match, try to find any container with 'mongodb' in the name
  try {
    const { stdout } = await execAsync(`docker ps --filter "name=mongodb" --format "{{.Names}}"`);
    const containers = stdout.trim().split('\n').filter(name => name.length > 0);
    if (containers.length > 0) {
      return containers[0];
    }
  } catch (error) {
    // No containers found
  }

  throw new Error('No MongoDB container found. Please ensure MongoDB is running.');
}

// Extract zip archive based on platform
async function extractZipArchive(zipPath, extractDir) {
  const platform = os.platform();
  
  if (platform === 'win32') {
    // Use PowerShell's Expand-Archive on Windows
    const powerShellCommand = `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractDir}' -Force"`;
    await execAsync(powerShellCommand);
  } else {
    // Use unzip command on Unix-like systems
    const unzipCommand = `cd "${extractDir}" && unzip "${zipPath}"`;
    await execAsync(unzipCommand);
  }
}

// Configuration
const mongoConfig = parseMongoUri(process.env.MONGO_URI);
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

async function restoreDatabase(backupZipPath) {
  try {
    // Validate input
    if (!backupZipPath) {
      console.error('❌ Please provide the path to the backup zip file');
      console.log('Usage: node scripts/restore-db.js <backup-file.zip>');
      console.log('Example: node scripts/restore-db.js backups/learning-journey-backup-2024-01-15T10-30-00-000Z.zip');
      process.exit(1);
    }

    // Check if backup file exists
    if (!fs.existsSync(backupZipPath)) {
      throw new Error(`Backup file not found: ${backupZipPath}`);
    }

    console.log('🚀 Starting database restore...');
    console.log(`📁 Restoring from: ${backupZipPath}`);
    console.log(`🗄️ Database: ${mongoConfig.database}`);
    console.log(`🔗 Host: ${mongoConfig.host}:${mongoConfig.port}`);

    // Find the correct MongoDB container
    console.log('🔍 Finding MongoDB container...');
    const containerName = await findMongoContainer();
    console.log(`✅ Found MongoDB container: ${containerName}`);

    // Extract zip file
    console.log('📦 Extracting backup archive...');
    const extractDir = path.join(BACKUP_DIR, 'temp-restore');
    
    // Clean up any existing temp directory
    if (fs.existsSync(extractDir)) {
      await execAsync(`rm -rf "${extractDir}"`);
    }
    
    // Create temp directory and extract
    fs.mkdirSync(extractDir, { recursive: true });
    await extractZipArchive(backupZipPath, extractDir);
    console.log('✅ Backup archive extracted');

    // Find the extracted backup directory
    const extractedItems = fs.readdirSync(extractDir);
    if (extractedItems.length === 0) {
      throw new Error('No files found in the backup archive');
    }

    const backupDirName = extractedItems[0]; // Should be the backup directory
    const extractedBackupPath = path.join(extractDir, backupDirName);

    // Copy backup to container
    console.log('📋 Copying backup to container...');
    const copyToContainerCommand = `docker cp "${extractedBackupPath}" ${containerName}:/tmp/`;
    await execAsync(copyToContainerCommand);
    console.log('✅ Backup copied to container');

    // Drop existing database (optional - you might want to make this configurable)
    console.log('🗑️ Dropping existing database...');
    const dropCommand = `docker exec ${containerName} mongosh --username ${mongoConfig.username} --password ${mongoConfig.password} --authenticationDatabase ${mongoConfig.authSource} --eval "use ${mongoConfig.database}; db.dropDatabase();"`;
    await execAsync(dropCommand);
    console.log('✅ Existing database dropped');

    // Restore database
    console.log('🔄 Restoring database...');
    const restoreCommand = `docker exec ${containerName} mongorestore --db ${mongoConfig.database} --username ${mongoConfig.username} --password ${mongoConfig.password} --authenticationDatabase ${mongoConfig.authSource} /tmp/${backupDirName}/${mongoConfig.database}`;
    await execAsync(restoreCommand);
    console.log('✅ Database restored successfully');

    // Clean up temporary files
    console.log('🧹 Cleaning up temporary files...');
    const cleanupContainer = `docker exec ${containerName} rm -rf /tmp/${backupDirName}`;
    await execAsync(cleanupContainer);
    
    const cleanupHost = `rm -rf "${extractDir}"`;
    await execAsync(cleanupHost);
    console.log('✅ Temporary files cleaned up');

    console.log('🎉 Database restore completed successfully!');
    console.log(`⏰ Restored at: ${new Date().toLocaleString()}`);
    console.log('💡 You may need to restart your application to see the changes.');

  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    
    // Clean up on error
    const extractDir = path.join(BACKUP_DIR, 'temp-restore');
    if (fs.existsSync(extractDir)) {
      try {
        await execAsync(`rm -rf "${extractDir}"`);
        console.log('🧹 Cleaned up temporary files after error');
      } catch (cleanupError) {
        console.error('⚠️ Failed to clean up temporary files:', cleanupError.message);
      }
    }
    
    process.exit(1);
  }
}

// Get backup file path from command line arguments
const backupZipPath = process.argv[2];

// Run restore
restoreDatabase(backupZipPath);
