#!/usr/bin/env node

// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Learning Journey - Setup Script');
console.log('=====================================\n');

// Check if Docker is installed
try {
  execSync('docker --version', { stdio: 'pipe' });
  console.log('✅ Docker is installed');
} catch (error) {
  console.error('❌ Docker is not installed. Please install Docker first.');
  process.exit(1);
}

// Check if Docker Compose is installed
try {
  execSync('docker-compose --version', { stdio: 'pipe' });
  console.log('✅ Docker Compose is installed');
} catch (error) {
  console.error('❌ Docker Compose is not installed. Please install Docker Compose first.');
  process.exit(1);
}

// Check if .env.local exists
const envPath = join(process.cwd(), '.env.local');
if (!existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  const envContent = `# Database Configuration
MONGO_URI=mongodb://admin:password123@localhost:27017/learning_journey?authSource=admin

# Application Configuration
NODE_ENV=development
PORT=3000
`;
  
  try {
    const fs = await import('fs');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local file created');
  } catch (error) {
    console.error('❌ Failed to create .env.local file:', error.message);
  }
} else {
  console.log('✅ .env.local file already exists');
}

console.log('\n🔧 Starting Docker services...');
try {
  execSync('docker-compose up -d', { stdio: 'inherit' });
  console.log('✅ Docker services started');
} catch (error) {
  console.error('❌ Failed to start Docker services:', error.message);
  process.exit(1);
}

console.log('\n⏳ Waiting for MongoDB to be ready...');
console.log('   (This may take up to 30 seconds)');

// Wait for MongoDB to be ready
let attempts = 0;
const maxAttempts = 30;

const waitForMongo = async () => {
  try {
    execSync('docker-compose exec -T mongodb mongosh --eval "db.runCommand(\'ping\')"', { 
      stdio: 'pipe',
      timeout: 5000 
    });
    console.log('✅ MongoDB is ready');
    return true;
  } catch (error) {
    attempts++;
    if (attempts >= maxAttempts) {
      console.error('❌ MongoDB failed to start within the expected time');
      return false;
    }
    process.stdout.write('.');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return waitForMongo();
  }
};

const mongoReady = await waitForMongo();
if (!mongoReady) {
  process.exit(1);
}

console.log('\n📊 Running data migration...');
try {
  execSync('npm run migrate', { stdio: 'inherit' });
  console.log('✅ Data migration completed');
} catch (error) {
  console.error('❌ Data migration failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('   1. Open http://localhost:3000 to access the application');
console.log('   2. Open http://localhost:8081 to access MongoDB Express (admin/password123)');
console.log('   3. Run "npm run dev" for local development');
console.log('\n📚 For more information, see SETUP.md');
