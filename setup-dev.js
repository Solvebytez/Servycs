const fs = require('fs');
const path = require('path');

// Create .env file for development
const envContent = `# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration (Update with your PostgreSQL details)
DATABASE_URL="postgresql://postgres:password@localhost:5432/listro_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Shared Sign-in Token Secret (same as frontend EXPO_PUBLIC_SECRET_KEY)
SHARED_SIGNIN_SECRET=569e7af56a051588377545b8890ecb8540e01800759753cb1b30526beb36fe79d471bec938ca1e524b217f2351b9febb9b30eb6850869265073a68b162afe643

# Cookie Configuration
COOKIE_SECRET=your-super-secret-cookie-key-here-change-in-production
COOKIE_DOMAIN=localhost
COOKIE_SECURE=false
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=lax

# File Upload Configuration (Update with your Cloudinary details)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (Update with your SMTP details)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@listro.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-change-in-production
`;

// Write .env file
fs.writeFileSync(path.join(__dirname, '.env'), envContent);

console.log('✅ Development environment file (.env) created successfully!');
console.log('📝 Please update the .env file with your actual configuration values:');
console.log('   - DATABASE_URL: Your PostgreSQL connection string');
console.log('   - CLOUDINARY_*: Your Cloudinary credentials');
console.log('   - SMTP_*: Your email service credentials');
console.log('   - JWT_*: Strong secret keys for production');
console.log('');
console.log('🚀 Next steps:');
console.log('   1. Update .env with your configuration');
console.log('   2. Run: npm run db:migrate');
console.log('   3. Run: npm run dev');
