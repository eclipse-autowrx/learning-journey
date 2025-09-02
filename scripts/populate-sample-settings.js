// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from '../src/lib/mongodb.js';
import SystemSettings from '../src/lib/models/SystemSettings.js';

const sampleSettings = [
  {
    key: 'PRIMARY_COLOR',
    value: '#3B82F6',
    secret: false,
    description: 'Primary brand color for the application',
    category: 'ui'
  },
  {
    key: 'SECONDARY_COLOR',
    value: '#6B7280',
    secret: false,
    description: 'Secondary color for the application',
    category: 'ui'
  },
  {
    key: 'SYSTEM_FONT',
    value: 'Inter',
    secret: false,
    description: 'Default system font family',
    category: 'ui'
  },
  {
    key: 'MAX_FILE_SIZE',
    value: 10485760,
    secret: false,
    description: 'Maximum file upload size in bytes (10MB)',
    category: 'general'
  },
  {
    key: 'SESSION_TIMEOUT',
    value: 3600,
    secret: false,
    description: 'Session timeout in seconds (1 hour)',
    category: 'auth'
  },
  {
    key: 'LLM_APIKEY',
    value: 'sk-sample-api-key-12345',
    secret: true,
    description: 'API key for LLM service integration',
    category: 'api'
  },
  {
    key: 'DATABASE_URL',
    value: 'mongodb://localhost:27017/learning-journey',
    secret: true,
    description: 'Database connection string',
    category: 'database'
  },
  {
    key: 'EMAIL_SERVICE_KEY',
    value: 'email-service-key-abc123',
    secret: true,
    description: 'Email service API key',
    category: 'api'
  },
  {
    key: 'FEATURE_FLAGS',
    value: {
      enableCertificates: true,
      enableProgressTracking: true,
      enableNotifications: false,
      enableDarkMode: true
    },
    secret: false,
    description: 'Feature flags to control application behavior',
    category: 'general'
  },
  {
    key: 'NOTIFICATION_SETTINGS',
    value: {
      email: true,
      push: false,
      sms: false
    },
    secret: false,
    description: 'Default notification preferences',
    category: 'notifications'
  }
];

async function populateSampleSettings() {
  try {
    await connectToDatabase();
    console.log('Connected to database');

    // Clear existing sample settings
    await SystemSettings.deleteMany({
      key: { $in: sampleSettings.map(s => s.key) }
    });
    console.log('Cleared existing sample settings');

    // Insert sample settings
    const settingsWithUpdatedBy = sampleSettings.map(setting => ({
      ...setting,
      updated_by: 'system'
    }));

    const insertedSettings = await SystemSettings.insertMany(settingsWithUpdatedBy);
    console.log(`Inserted ${insertedSettings.length} sample settings:`);
    
    insertedSettings.forEach(setting => {
      console.log(`- ${setting.key} (${setting.secret ? 'SECRET' : 'PUBLIC'}) - ${setting.category}`);
    });

    console.log('\nSample settings populated successfully!');
    console.log('\nYou can now:');
    console.log('1. Visit /admin and go to the "System Settings" tab');
    console.log('2. View public settings at /api/settings');
    console.log('3. Manage all settings (including secrets) via admin APIs');

  } catch (error) {
    console.error('Error populating sample settings:', error);
  } finally {
    process.exit(0);
  }
}

populateSampleSettings();
