#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Learning Journey - Production Setup');
console.log('======================================\n');

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

// Check if .env.prod exists
const envPath = join(process.cwd(), '.env.prod');
if (!existsSync(envPath)) {
  console.log('📝 Creating .env.prod file from template...');
  console.log('⚠️  Please review and update .env.prod with your production settings');
  
  try {
    const fs = await import('fs');
    const templatePath = join(process.cwd(), 'env.prod.example');
    if (existsSync(templatePath)) {
      fs.copyFileSync(templatePath, envPath);
      console.log('✅ .env.prod file created from template');
    } else {
      console.error('❌ env.prod.example template not found');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to create .env.prod file:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ .env.prod file already exists');
}

// Check SSL certificates for Nginx
const sslDir = join(process.cwd(), 'nginx', 'ssl');
if (!existsSync(sslDir)) {
  console.log('📁 Creating SSL directory...');
  try {
    const fs = await import('fs');
    fs.mkdirSync(sslDir, { recursive: true });
    console.log('✅ SSL directory created');
  } catch (error) {
    console.error('❌ Failed to create SSL directory:', error.message);
  }
}

// Check if SSL certificates exist
const certPath = join(sslDir, 'cert.pem');
const keyPath = join(sslDir, 'key.pem');

if (!existsSync(certPath) || !existsSync(keyPath)) {
  console.log('🔒 SSL certificates not found in nginx/ssl/');
  console.log('⚠️  For production, you need to add your SSL certificates:');
  console.log('   - nginx/ssl/cert.pem (SSL certificate)');
  console.log('   - nginx/ssl/key.pem (SSL private key)');
  console.log('\n   Or use self-signed certificates for testing:');
  console.log('   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\');
  console.log('     -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem');
}

console.log('\n🔧 Building and starting production services...');
try {
  // Build the application first
  console.log('📦 Building Next.js application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Start production services
  execSync('docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d', { stdio: 'inherit' });
  console.log('✅ Production services started');
} catch (error) {
  console.error('❌ Failed to start production services:', error.message);
  process.exit(1);
}

console.log('\n⏳ Waiting for services to be ready...');

// Wait for MongoDB to be ready
let attempts = 0;
const maxAttempts = 30;

const waitForMongo = async () => {
  try {
    execSync('docker-compose -f docker-compose.prod.yml --env-file .env.prod exec -T mongodb mongosh --eval "db.runCommand(\'ping\')"', { 
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

// Wait for application to be ready
console.log('\n⏳ Waiting for application to be ready...');
attempts = 0;

const waitForApp = async () => {
  try {
    execSync('curl -f http://localhost:3000/api/health', { 
      stdio: 'pipe',
      timeout: 5000 
    });
    console.log('✅ Application is ready');
    return true;
  } catch (error) {
    attempts++;
    if (attempts >= 20) {
      console.error('❌ Application failed to start within the expected time');
      return false;
    }
    process.stdout.write('.');
    await new Promise(resolve => setTimeout(resolve, 2000));
    return waitForApp();
  }
};

const appReady = await waitForApp();
if (!appReady) {
  process.exit(1);
}

console.log('\n🎉 Production setup completed successfully!');
console.log('\n📋 Services:');
console.log('   - Application: http://localhost:3000');
console.log('   - MongoDB Express: http://localhost:8081 (if admin profile enabled)');
console.log('   - Nginx: http://localhost:80 (if nginx profile enabled)');
console.log('\n📚 Available commands:');
console.log('   - npm run docker:prod:up      - Start production services');
console.log('   - npm run docker:prod:down    - Stop production services');
console.log('   - npm run docker:prod:logs    - View service logs');
console.log('   - npm run docker:prod:admin   - Start with MongoDB Express');
console.log('   - npm run docker:prod:nginx   - Start with Nginx');
console.log('   - npm run docker:prod:full    - Start with all services');
console.log('\n🔒 Security notes:');
console.log('   - Update passwords in .env.prod');
console.log('   - Add proper SSL certificates');
console.log('   - Configure firewall rules');
console.log('   - Set up monitoring and logging');
console.log('\n📚 For more information, see SETUP.md');
