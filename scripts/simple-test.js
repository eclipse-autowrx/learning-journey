// Simple test script to debug the issue
console.log('🚀 Starting simple test...');

// Load environment variables
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📁 Script directory:', __dirname);
console.log('🔍 Looking for .env at:', join(__dirname, '..', '.env'));

// Load .env from project root
config({ path: join(__dirname, '..', '.env') });

console.log('🔗 MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Not found');

// Test database connection with timeout
console.log('🔄 Testing database connection...');

try {
  // Import mongodb connection
  const connectToDatabase = (await import('../src/lib/mongodb.js')).default;
  
  console.log('✅ MongoDB module imported successfully');
  
  // Set a timeout for the connection
  const connectionPromise = connectToDatabase();
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000);
  });
  
  console.log('🔄 Attempting to connect...');
  await Promise.race([connectionPromise, timeoutPromise]);
  console.log('✅ Database connected successfully!');
  
  // Test a simple query
  const Path = (await import('../src/lib/models/Path.js')).default;
  const paths = await Path.find({}).limit(1).lean();
  console.log('✅ Query successful! Found', paths.length, 'paths');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}

console.log('🏁 Test completed');
process.exit(0);
