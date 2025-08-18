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

console.log('🚀 Learning Journey - Development Setup');
console.log('========================================\n');

// Check if Docker is installed
try {
  execSync('docker --version', { stdio: 'pipe' });
  console.log('✅ Docker is installed');
} catch (error) {
  console.error('❌ Docker is not installed. Please install Docker first.');
  process.exit(1);
}

// Resolve Docker Compose command (plugin or legacy)
let composeCmd = 'docker compose';
try {
  execSync('docker compose version', { stdio: 'pipe' });
  console.log('✅ Docker Compose (plugin) is available');
} catch (e) {
  try {
    execSync('docker-compose --version', { stdio: 'pipe' });
    composeCmd = 'docker-compose';
    console.log('✅ Docker Compose (legacy) is available');
  } catch (err) {
    console.error('❌ Docker Compose not found. Install Docker Desktop and enable WSL integration, or install docker-compose.');
    process.exit(1);
  }
}

// Check if .env.dev exists
const envPath = join(process.cwd(), '.env.dev');
if (!existsSync(envPath)) {
  console.log('📝 Creating .env.dev file...');
  const envContent = `# Development Environment Variables

# Database Configuration
MONGO_URI=mongodb://admin:password123@localhost:27017/learning_journey?authSource=admin

# Application Configuration
NODE_ENV=development
PORT=3000

# Development specific settings
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;
  
  try {
    const fs = await import('fs');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.dev file created');
  } catch (error) {
    console.error('❌ Failed to create .env.dev file:', error.message);
  }
} else {
  console.log('✅ .env.dev file already exists');
}

console.log('\n🔧 Starting MongoDB and MongoDB Express...');
try {
  execSync(`${composeCmd} -f docker-compose.dev.yml up -d`, { stdio: 'inherit' });
  console.log('✅ Development services started');
} catch (error) {
  console.error('❌ Failed to start development services:', error.message);
  process.exit(1);
}

console.log('\n⏳ Waiting for MongoDB to be ready...');
console.log('   (This may take up to 30 seconds)');

// Wait for MongoDB to be ready
let attempts = 0;
const maxAttempts = 30;

const waitForMongo = async () => {
  try {
    execSync(`${composeCmd} -f docker-compose.dev.yml exec -T mongodb mongosh --eval "db.runCommand('ping')"`, { 
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

// console.log('\n📊 Running data migration...');
// try {
//   execSync('npm run migrate', { stdio: 'inherit' });
//   console.log('✅ Data migration completed');
// } catch (error) {
//   console.error('❌ Data migration failed:', error.message);
//   process.exit(1);
// }

console.log('\n🎉 Development setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('   1. Run "npm run dev" to start the development server');
console.log('   2. Open http://localhost:3000 to access the application');
console.log('   3. Open http://localhost:8081 to access MongoDB Express (admin/password123)');
console.log('\n📚 Available commands:');
console.log('   - npm run docker:dev:up    - Start development services');
console.log('   - npm run docker:dev:down  - Stop development services');
console.log('   - npm run docker:dev:logs  - View service logs');
console.log('   - npm run migrate          - Migrate data to database');
console.log('\n📚 For more information, see SETUP.md');
