# Database Setup and Migration Guide

This guide will help you set up the PostgreSQL database and migrate the existing JSON data to the database.

## Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** and **npm** installed
3. **Environment variables** configured

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fieldbook_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d

# Application Configuration
NODE_ENV=development
PORT=8000
```

## Database Setup

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fieldbook_db;

# Exit psql
\q
```

### 2. Initialize Database Schema

```bash
# Run the database initialization script
npm run init-db
```

This will create the users table and insert initial admin users.

### 3. Run Database Migration

```bash
# Run the complete migration script
npm run migrate
```

This will:

- Create all database tables (fields, bookings, facilities, etc.)
- Migrate existing JSON data to the database
- Set up proper relationships and constraints

## Database Schema Overview

### Tables Created

1. **users** - User authentication and profiles
2. **sport_types** - Available sport types
3. **facilities** - Available facilities/amenities
4. **fields** - Sports fields with details
5. **field_images** - Field images
6. **field_facilities** - Many-to-many relationship between fields and facilities
7. **field_availability** - Field availability slots
8. **bookings** - User bookings
9. **booking_payments** - Payment information
10. **booking_reviews** - User reviews

### Key Features

- **Soft deletes** for fields (is_active flag)
- **Audit trails** with created_at and updated_at timestamps
- **Proper indexing** for performance
- **Foreign key constraints** for data integrity
- **Enum types** for booking and payment statuses

## Migration Process

The migration script (`scripts/migrate-to-database.js`) performs the following:

1. **Schema Migration**
   - Creates all necessary tables
   - Sets up indexes and constraints
   - Inserts initial data (sport types, facilities)

2. **Data Migration**
   - Reads JSON files from `data/` directory
   - Transforms and inserts data into database tables
   - Maintains relationships between entities

3. **Validation**
   - Ensures data integrity
   - Logs migration progress
   - Handles errors gracefully

## Verification

After migration, verify the setup:

```bash
# Check database connection
npm run test-auth

# View API documentation
# Open http://localhost:8000/api/v1/docs
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**

   ```
   Error: connect ECONNREFUSED 127.0.0.1:5432
   ```

   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **Permission Denied**

   ```
   Error: permission denied for table users
   ```

   - Check database user permissions
   - Ensure user has CREATE, INSERT, UPDATE privileges

3. **Migration Errors**
   ```
   Error: relation "fields" already exists
   ```

   - Drop existing tables if needed
   - Run `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`

### Reset Database

To completely reset the database:

```sql
-- Connect to PostgreSQL
psql -U postgres -d fieldbook_db

-- Drop all tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Exit
\q
```

Then run the migration again:

```bash
npm run migrate
```

## Production Deployment

For production deployment:

1. **Use strong passwords** for database
2. **Enable SSL** for database connections
3. **Set up proper backups**
4. **Configure connection pooling**
5. **Monitor database performance**

### Environment Variables for Production

```env
NODE_ENV=production
DB_HOST=your_production_host
DB_PORT=5432
DB_NAME=fieldbook_prod
DB_USER=fieldbook_user
DB_PASSWORD=strong_password_here
JWT_SECRET=very_strong_jwt_secret
JWT_REFRESH_SECRET=very_strong_refresh_secret
```

## API Endpoints

After migration, all endpoints will use the database:

- **Fields**: `GET /api/v1/fields` - Now with database filtering
- **Bookings**: `POST /api/v1/bookings` - Now with conflict checking
- **Admin**: All admin endpoints now use database operations

## Monitoring and Logs

The application includes comprehensive logging:

- **Request logs**: All API requests
- **Error logs**: Application errors
- **Database logs**: Database operations
- **Security logs**: Authentication events

Logs are stored in the `logs/` directory and also output to console.

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried columns are indexed
2. **Pagination**: All list endpoints support pagination
3. **Connection pooling**: PostgreSQL connection pooling is configured
4. **Query optimization**: Complex queries are optimized for performance

## Backup and Recovery

### Backup Database

```bash
pg_dump -U postgres fieldbook_db > backup.sql
```

### Restore Database

```bash
psql -U postgres fieldbook_db < backup.sql
```

## Support

If you encounter issues:

1. Check the logs in `logs/` directory
2. Verify environment variables
3. Test database connection
4. Review migration script output

For additional help, check the main README.md file or create an issue in the repository.
