# Listro Backend API

A comprehensive service marketplace backend built with Node.js, Express, TypeScript, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Database**: PostgreSQL with Prisma ORM
- **File Upload**: Cloudinary integration for image uploads
- **Email Service**: Nodemailer for transactional emails
- **Security**: Helmet, CORS, Rate limiting, Input validation
- **Logging**: Winston logger with file rotation
- **API Documentation**: Comprehensive API endpoints

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/listro_db"
   
   # JWT Secrets
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   
   # File Upload
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Email
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed database (optional)
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Server entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database

## 🔐 Authentication

The API uses JWT tokens for authentication:

- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (30 days) stored in HTTP-only cookies

### Protected Routes

Use the `Authorization` header with Bearer token:
```
Authorization: Bearer <access_token>
```

### Role-Based Access

- `USER` - Regular users
- `VENDOR` - Service providers
- `SALESMAN` - Business development team
- `ADMIN` - Platform administrators

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/verify-email` - Verify email address

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

### Vendors
- `GET /api/v1/vendors/dashboard` - Vendor dashboard
- `POST /api/v1/vendors/register` - Register as vendor

### Services
- `GET /api/v1/services` - Get all services
- `POST /api/v1/services` - Create new service
- `GET /api/v1/services/:id` - Get service details

### Bookings
- `GET /api/v1/bookings` - Get user bookings
- `POST /api/v1/bookings` - Create new booking

### Admin
- `GET /api/v1/admin/dashboard` - Admin dashboard
- `GET /api/v1/admin/users` - Manage users
- `GET /api/v1/admin/vendors` - Manage vendors

### File Upload
- `POST /api/v1/upload/single` - Upload single file
- `POST /api/v1/upload/multiple` - Upload multiple files

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users** - User accounts with role-based access
- **Vendors** - Service providers
- **Salesmen** - Business development team
- **Services** - Service offerings
- **Bookings** - Service bookings
- **Reviews** - User reviews and ratings
- **Support Tickets** - Customer support system

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (RBAC)
- **Input Validation** with express-validator
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Helmet** for security headers
- **Password Hashing** with bcrypt
- **SQL Injection Protection** with Prisma ORM

## 📧 Email Service

The application sends transactional emails for:

- Email verification
- Password reset
- Booking confirmations
- Vendor approval notifications

## 🚀 Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start the server**
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
# Servycs-backend
