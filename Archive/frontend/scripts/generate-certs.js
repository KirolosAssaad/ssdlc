#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const certsDir = path.join(__dirname, '..', 'certs');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

const keyPath = path.join(certsDir, 'localhost-key.pem');
const certPath = path.join(certsDir, 'localhost.pem');

// Check if certificates already exist
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('✅ SSL certificates already exist');
  process.exit(0);
}

try {
  console.log('🔐 Generating self-signed SSL certificates for localhost...');
  
  // Generate private key
  execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });
  
  // Generate certificate
  execSync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -subj "/C=US/ST=Local/L=Local/O=Development/CN=localhost"`, { stdio: 'inherit' });
  
  console.log('✅ SSL certificates generated successfully!');
  console.log(`📁 Certificates saved to: ${certsDir}`);
  console.log('');
  console.log('🔧 To trust the certificate in your browser:');
  console.log('   Chrome/Edge: Go to chrome://settings/certificates → Authorities → Import');
  console.log('   Firefox: Go to about:preferences#privacy → View Certificates → Authorities → Import');
  console.log(`   Import file: ${certPath}`);
  
} catch (error) {
  console.error('❌ Error generating certificates:', error.message);
  console.log('');
  console.log('💡 Alternative: Install mkcert for easier certificate management:');
  console.log('   npm install -g mkcert');
  console.log('   mkcert -install');
  console.log('   mkcert localhost');
  process.exit(1);
}