# Fieldbook Backend API

A comprehensive sports field booking API built with Node.js, Express, and PostgreSQL.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based authentication with role-based access control
- **Field Management** - CRUD operations for sports fields with image galleries
- **Booking System** - Complete booking lifecycle with status tracking
- **Admin Dashboard** - Comprehensive admin panel for managing all aspects of the system
- **Database Integration** - PostgreSQL with proper migrations and data persistence
- **Error Handling** - Comprehensive error handling and logging system

### Technical Features
- **PostgreSQL Database** - Relational database with proper schema design
- **Image Storage** - Field images stored as URL arrays in the database
- **Pagination** - Efficient pagination for large datasets
- **Filtering & Search** - Advanced filtering by sport type, location, price, facilities
- **Logging** - Comprehensive logging system with file and console output
- **API Documentation** - Complete Swagger/OpenAPI documentation
- **CORS Support** - Cross-origin resource sharing configuration
- **Security** - JWT authentication, role-based authorization, input validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fieldbook-be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=8000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=fieldbook_db
   DB_USER=your_username
   DB_PASSWORD=your_password
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   
   # Logging Configuration
   LOG_LEVEL=info
   LOG_FILE_PATH=logs/app.log
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb fieldbook_db
   
   # Run migrations
   npm run migrate
   
   # Migrate JSON data to database
   npm run migrate-data
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts with role-based access
- **fields** - Sports fields with images stored as arrays
- **facilities** - Field facilities and amenities
- **sport_types** - Available sport types
- **bookings** - Booking records with status tracking
- **field_availability** - Field availability schedules

### Key Features
- **Image Storage**: Field images stored as PostgreSQL arrays (`TEXT[]`)
- **Soft Deletes**: Records marked as inactive rather than deleted
- **Audit Trail**: Created/updated timestamps on all tables
- **Foreign Keys**: Proper referential integrity
- **Indexes**: Optimized queries with strategic indexing

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token

### Field Endpoints
- `GET /api/v1/fields` - Get all fields with pagination and filtering
- `GET /api/v1/fields/:id` - Get field details
- `GET /api/v1/fields/filters` - Get filter options

### Booking Endpoints
- `POST /api/v1/bookings` - Create a new booking
- `GET /api/v1/bookings` - Get user's bookings
- `PUT /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id` - Cancel booking

### Admin Endpoints
- `GET /api/v1/admin/fields` - Get all fields (admin view)
- `POST /api/v1/admin/fields` - Create new field
- `PUT /api/v1/admin/fields/:id` - Update field
- `DELETE /api/v1/admin/fields/:id` - Delete field
- `GET /api/v1/admin/bookings` - Get all bookings
- `PUT /api/v1/admin/bookings/:id` - Update booking status
- `GET /api/v1/admin/users` - Get all users
- `PUT /api/v1/admin/users/:id` - Update user role
- `DELETE /api/v1/admin/users/:id` - Delete user

### Swagger Documentation
Access the interactive API documentation at:
- Development: `http://localhost:8000/api-docs`
- Production: `https://your-domain.com/api-docs`

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 8000)
- `NODE_ENV` - Environment (development/production)
- `DB_*` - Database connection parameters
- `JWT_*` - JWT configuration
- `CORS_ORIGIN` - Allowed CORS origins
- `LOG_*` - Logging configuration

### Database Configuration
The application uses PostgreSQL with the following features:
- Connection pooling for performance
- Automatic reconnection handling
- Transaction support for data integrity
- Prepared statements for security

## 🚀 Deployment

### Production Setup
1. **Database Migration**
   ```bash
   npm run migrate
   npm run migrate-data
   ```

2. **Environment Configuration**
   - Set `NODE_ENV=production`
   - Configure production database credentials
   - Set secure JWT secret
   - Configure CORS for production domain

3. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

### Docker Deployment
```bash
# Build image
docker build -t fieldbook-be .

# Run container
docker run -p 8000:8000 fieldbook-be
```

## 📊 Monitoring & Logging

### Logging System
- **Request Logging**: All API requests logged with timing
- **Error Logging**: Detailed error logs with stack traces
- **Database Logging**: SQL queries and performance metrics
- **Authentication Logging**: Login attempts and token operations
- **File Output**: Logs saved to `logs/app.log`
- **Console Output**: Real-time logging to console

### Health Checks
- Database connectivity
- API endpoint availability
- System resource usage

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: Admin and customer role separation
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **CORS Protection**: Configurable cross-origin restrictions
- **Error Handling**: Secure error responses without sensitive data

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test files
npm test -- --grep "auth"
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run migrate-data` - Migrate JSON data to database
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@fieldbook.com
- Documentation: `/api-docs`
- Issues: GitHub Issues

## 🔄 Changelog

### v2.0.0
- **Major**: Migrated to PostgreSQL database
- **Feature**: Admin CRUD operations for fields, bookings, and users
- **Feature**: Comprehensive logging system
- **Feature**: Image storage as arrays in database
- **Feature**: Enhanced error handling and validation
- **Feature**: Complete Swagger documentation
- **Performance**: Database indexing and query optimization
- **Security**: Role-based authorization and input validation

### v1.0.0
- Initial release with JSON file storage
- Basic authentication and field management
- Simple booking system 