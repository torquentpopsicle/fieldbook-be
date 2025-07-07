# Database Migration Guide

This guide will help you set up the PostgreSQL database and migrate your data.

## Prerequisites

1. **PostgreSQL installed and running**
2. **Database credentials configured in `.env`**
3. **All migration files are in the `migrations/` directory**

## Step-by-Step Migration

### 1. Create the Database

```bash
# Create a new database
createdb -U your_db_user fieldbook_db
```

### 2. Run Schema Migrations

This will create all tables, constraints, and indexes:

```bash
npm run migrate
```

### 3. Migrate JSON Data

This will import your existing JSON data into the database:

```bash
npm run migrate-data
```

### 4. Verify the Migration

Check that your data was migrated correctly:

```bash
# Connect to your database
psql -U your_db_user -d fieldbook_db

# Check tables
\dt

# Check field data
SELECT COUNT(*) FROM fields;

# Check user data
SELECT COUNT(*) FROM users;

# Check facilities
SELECT COUNT(*) FROM facilities;
```

## Troubleshooting

### Common Issues Fixed

1. **Enum Type Already Exists**
   - **Problem**: `type "booking_status" already exists`
   - **Solution**: Schema migration now handles duplicate enum types gracefully
   - **Status**: ✅ Fixed

2. **Foreign Key Constraint Violation**
   - **Problem**: `Key (field_id)=(101) is not present in table "fields"`
   - **Solution**: Added field ID 101 to fields.json and improved field existence checking
   - **Status**: ✅ Fixed

3. **Duplicate Schema Migration**
   - **Problem**: Schema was being run twice
   - **Solution**: Separated schema and data migrations into different scripts
   - **Status**: ✅ Fixed

4. **SQL Parsing Error**
   - **Problem**: `unterminated dollar-quoted string` in PostgreSQL functions
   - **Solution**: Removed complex database triggers and handle timestamps in application layer
   - **Status**: ✅ Fixed

### Migration Process

The migration now works in two separate steps:

1. **Schema Migration** (`npm run migrate`):
   - Creates all tables, constraints, and indexes
   - Handles duplicate enum types gracefully
   - No complex database functions or triggers
   - Uses `scripts/migrate-schema.js`

2. **Data Migration** (`npm run migrate-data`):
   - Imports JSON data into database
   - Checks field existence before inserting details
   - Uses `scripts/migrate-to-database.js`

### Application Layer Timestamp Handling

Instead of database triggers, timestamps are handled in the application layer:

- **`updated_at`**: Automatically set to `CURRENT_TIMESTAMP` in all UPDATE operations
- **`created_at`**: Set automatically on INSERT operations
- **`cancelled_at`**: Set when bookings are cancelled
- **`paid_at`**: Set when payments are completed

This approach is:

- ✅ **Simpler**: No complex database functions
- ✅ **More reliable**: No SQL parsing issues
- ✅ **Easier to debug**: Clear application logic
- ✅ **More flexible**: Can add custom logic easily

### Data Structure

- **Fields**: IDs 101, 402-407 from `fields.json` (7 total fields)
- **Field Details**: Processes details for all existing fields
- **Images**: Stored as PostgreSQL arrays in the `fields` table
- **Availability**: Linked to existing fields only

## Migration Order

1. `001_create_users_table.sql` - Creates users table
2. `002_create_fields_tables.sql` - Creates fields, facilities, sport_types tables
3. `003_create_bookings_tables.sql` - Creates bookings and related tables
4. `scripts/migrate-to-database.js` - Migrates JSON data to database

## Success Indicators

After successful migration, you should see:

- ✅ All tables created with proper constraints
- ✅ Sport types and facilities inserted
- ✅ Fields data migrated (7 fields with IDs 101, 402-407)
- ✅ Field details migrated for all existing fields
- ✅ No constraint or syntax errors
- ✅ Clean, simple database schema without complex triggers

## Next Steps

After successful migration:

1. **Start the server**: `npm start`
2. **Test the API**: Visit `http://localhost:8000/api-docs`
3. **Verify endpoints**: Test a few API endpoints to ensure data is accessible

## Rollback (if needed)

If you need to start over:

```bash
# Drop the database
dropdb -U your_db_user fieldbook_db

# Recreate and migrate
createdb -U your_db_user fieldbook_db
npm run migrate-all
```
