#!/usr/bin/env node

// Environment Validation Script
// Checks if all required environment variables are configured

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REQUIRED_VARS = [
  'VITE_AWS_REGION',
  'VITE_COGNITO_USER_POOL_ID',
  'VITE_COGNITO_CLIENT_ID',
  'VITE_COGNITO_IDENTITY_POOL_ID',
  'VITE_S3_BUCKET_NAME',
  'VITE_S3_AUDIO_BUCKET',
  'VITE_BEDROCK_MODEL_ID',
  'VITE_API_GATEWAY_URL',
];

const OPTIONAL_VARS = [
  'VITE_CLOUDFRONT_DOMAIN',
  'VITE_APP_NAME',
  'VITE_APP_VERSION',
];

console.log('========================================');
console.log('MindCare Environment Validation');
console.log('========================================\n');

// Check if .env file exists
const envPath = path.join(path.dirname(__dirname), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('\nPlease create a .env file by:');
  console.log('1. Copying .env.example: cp .env.example .env');
  console.log('2. Or running the setup script: npm run setup:env');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();
    if (key && value) {
      envVars[key] = value;
    }
  }
});

// Validate required variables
let hasErrors = false;
const missing = [];
const empty = [];

console.log('Checking required environment variables:\n');

REQUIRED_VARS.forEach(varName => {
  if (!envVars[varName]) {
    missing.push(varName);
    console.log(`❌ ${varName}: NOT SET`);
    hasErrors = true;
  } else if (envVars[varName] === '') {
    empty.push(varName);
    console.log(`⚠️  ${varName}: EMPTY`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const displayValue = varName.includes('ID') || varName.includes('URL')
      ? envVars[varName].substring(0, 20) + '...'
      : envVars[varName];
    console.log(`✅ ${varName}: ${displayValue}`);
  }
});

// Check optional variables
console.log('\nChecking optional environment variables:\n');

OPTIONAL_VARS.forEach(varName => {
  if (!envVars[varName] || envVars[varName] === '') {
    console.log(`ℹ️  ${varName}: NOT SET (optional)`);
  } else {
    console.log(`✅ ${varName}: ${envVars[varName]}`);
  }
});

// Summary
console.log('\n========================================');
if (hasErrors) {
  console.log('❌ Validation FAILED\n');
  
  if (missing.length > 0) {
    console.log('Missing variables:');
    missing.forEach(v => console.log(`  - ${v}`));
    console.log('');
  }
  
  if (empty.length > 0) {
    console.log('Empty variables:');
    empty.length.forEach(v => console.log(`  - ${v}`));
    console.log('');
  }
  
  console.log('Please update your .env file with the correct values.');
  console.log('See AWS_ENVIRONMENT_SETUP_GUIDE.md for instructions.');
  process.exit(1);
} else {
  console.log('✅ Validation PASSED\n');
  console.log('All required environment variables are configured!');
  console.log('You can now run: npm run dev');
}

console.log('========================================\n');
