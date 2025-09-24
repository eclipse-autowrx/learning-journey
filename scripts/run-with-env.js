// Wrapper script to load environment variables before running other scripts
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
config({ path: join(__dirname, '..', '.env') });

// Verify environment variable is loaded
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI not found in environment variables');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('🔗 MONGO_URI:', process.env.MONGO_URI);

// Now import and run the actual script
const scriptPath = process.argv[2];
if (!scriptPath) {
  console.error('❌ Please provide a script path to run');
  console.log('Usage: node scripts/run-with-env.js <script-path>');
  process.exit(1);
}

try {
  const scriptModule = await import(scriptPath);
  console.log('✅ Script loaded successfully');
} catch (error) {
  console.error('❌ Error loading script:', error.message);
  process.exit(1);
}
