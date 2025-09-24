// Test script to verify environment variables are loaded
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Testing environment variables...');
console.log('Script location:', __dirname);
console.log('Looking for .env at:', join(__dirname, '..', '.env'));

// Try loading .env from project root
const result = config({ path: join(__dirname, '..', '.env') });
console.log('Dotenv result:', result);

console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Found' : '❌ Not found');

if (process.env.MONGO_URI) {
  console.log('✅ Environment variable is loaded correctly');
  console.log('Connection string:', process.env.MONGO_URI);
} else {
  console.log('❌ Environment variable not found');
  console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));
  console.log('All env vars starting with MONGO:', Object.keys(process.env).filter(key => key.startsWith('MONGO')));
}
