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

// Create zip archive based on platform
async function createZipArchive(sourcePath, zipPath) {
  const platform = os.platform();
  
  if (platform === 'win32') {
    // Use PowerShell's Compress-Archive on Windows
    const powerShellCommand = `powershell -Command "Compress-Archive -Path '${sourcePath}' -DestinationPath '${zipPath}' -Force"`;
    await execAsync(powerShellCommand);
  } else {
    // Use zip command on Unix-like systems
    const zipCommand = `cd "${path.dirname(sourcePath)}" && zip -r "${path.basename(zipPath)}" "${path.basename(sourcePath)}"`;
    await execAsync(zipCommand);
  }
}

// Configuration
const mongoConfig = parseMongoUri(process.env.MONGO_URI);
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function backupDatabase() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `learning-journey-backup-${timestamp}`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);
    const zipFilePath = path.join(BACKUP_DIR, `${backupFileName}.zip`);
    
    console.log('🚀 Starting database backup...');
    console.log(`📁 Backup will be saved to: ${backupPath}`);
    console.log(`🗄️ Database: ${mongoConfig.database}`);
    console.log(`🔗 Host: ${mongoConfig.host}:${mongoConfig.port}`);
    
    // Find the correct MongoDB container
    console.log('🔍 Finding MongoDB container...');
    const containerName = await findMongoContainer();
    console.log(`✅ Found MongoDB container: ${containerName}`);
    
    // Create backup using mongodump
    console.log('📦 Creating database backup...');
    const mongodumpCommand = `docker exec ${containerName} mongodump --db ${mongoConfig.database} --username ${mongoConfig.username} --password ${mongoConfig.password} --authenticationDatabase ${mongoConfig.authSource} --out /tmp/${backupFileName}`;
    
    await execAsync(mongodumpCommand);
    console.log('✅ Database dump created successfully');
    
    // Copy backup from container to host
    console.log('📋 Copying backup from container to host...');
    const copyCommand = `docker cp ${containerName}:/tmp/${backupFileName} ${backupPath}`;
    await execAsync(copyCommand);
    console.log('✅ Backup copied to host');
    
    // Create zip file
    console.log('🗜️ Creating zip archive...');
    await createZipArchive(backupPath, zipFilePath);
    console.log('✅ Zip archive created');
    
    // Clean up temporary files
    console.log('🧹 Cleaning up temporary files...');
    const cleanupContainer = `docker exec ${containerName} rm -rf /tmp/${backupFileName}`;
    await execAsync(cleanupContainer);
    
    const cleanupHost = `rm -rf "${backupPath}"`;
    await execAsync(cleanupHost);
    
    const stats = fs.statSync(zipFilePath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('🎉 Backup completed successfully!');
    console.log(`📄 Backup file: ${zipFilePath}`);
    console.log(`📊 File size: ${fileSizeInMB} MB`);
    console.log(`⏰ Created at: ${new Date().toLocaleString()}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

// Run backup
backupDatabase();
