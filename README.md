# Fieldbook Backend API

A Node.js/Express API for managing sports field bookings.

## Project Structure

```
fieldbook-be/
├── data/                    # JSON data files
│   ├── fields.json         # All fields data
│   ├── field-details.json  # Detailed field information
│   ├── filters.json        # Filter options
│   ├── featured-fields.json # Featured fields
│   ├── locations.json      # Location autocomplete data
│   └── users.json          # User authentication data (legacy)
├── routes/                  # Route handlers
│   ├── fields.js           # Fields endpoints
│   ├── featured.js         # Featured fields endpoints
│   ├── locations.js        # Location endpoints
│   ├── bookings.js         # Booking endpoints
│   └── auth.js             # Authentication endpoints
├── services/               # Business logic
│   ├── dataService.js      # Data loading and management
│   ├── db.js              # PostgreSQL connection
│   └── userService.js      # User database operations
├── config/                 # Configuration files
│   └── swagger.js          # Swagger/OpenAPI configuration
├── migrations/             # Database migrations
│   └── 001_create_users_table.sql
├── scripts/                # Utility scripts
│   └── init-db.js         # Database initialization
├── .vscode/               # VS Code settings
│   └── settings.json      # Editor configuration
├── index.js                # Main application file
├── env.example             # Environment variables template
├── .prettierrc            # Prettier configuration
├── .prettierignore        # Prettier ignore rules
└── package.json

## Features

- **Modular Architecture**: Separated routes, services, and data
- **PostgreSQL Database**: User authentication stored in PostgreSQL
- **JSON Data Storage**: Field data stored in separate JSON files
- **Caching**: Data service caches loaded JSON files for performance
- **Error Handling**: Proper error responses for all endpoints
- **CORS Support**: Configured for frontend development
- **Security**: Helmet middleware for security headers
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Environment Configuration**: Secure database credentials management
- **Code Formatting**: Prettier configuration for consistent code style

## API Documentation

Interactive API documentation is available at `/api/v1/docs` when the server is running.

### API Endpoints

#### Fields
- `GET /api/v1/fields` - Get all fields with pagination
- `GET /api/v1/fields/:field_id` - Get field details
- `GET /api/v1/fields/filters` - Get filter options

#### Featured Fields
- `GET /api/v1/featured-fields` - Get featured fields

#### Locations
- `GET /api/v1/locations/autocomplete` - Location autocomplete

#### Bookings
- `POST /api/v1/bookings` - Create a new booking

#### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

## Database Setup

### PostgreSQL Configuration

The application uses PostgreSQL for user authentication. Set up your database:

1. **Install PostgreSQL** (if not already installed)
2. **Create a database**: `createdb fieldbook_db`
3. **Configure environment variables** in `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=fieldbook_db
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   ```
4. **Initialize the database**:
   ```bash
   npm run init-db
   ```

### Data Organization

- **PostgreSQL**: User authentication and account data
- **JSON Files**: Field data and other static content:
  - **fields.json**: Contains paginated field listings
  - **field-details.json**: Detailed information for each field
  - **filters.json**: Available filter options
  - **featured-fields.json**: Featured/promoted fields
  - **locations.json**: Location data for autocomplete

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. Set up the database:
   ```bash
   npm run init-db
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. The API will be available at `http://localhost:8000`

## Code Formatting

This project uses Prettier for consistent code formatting:

- **Format all files**: `npm run format`
- **Check formatting**: `npm run format:check`
- **VS Code integration**: Install the Prettier extension for automatic formatting on save

### Formatting Rules

- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- 80 character line width
- Trailing commas in objects and arrays

## Development

The application uses a modular structure:

- **Routes**: Handle HTTP requests and responses
- **Services**: Contain business logic and data access
- **Data Files**: Store all example data in JSON format

This structure makes it easy to:
- Add new endpoints by creating new route files
- Modify data by editing JSON files
- Extend functionality by adding new services
- Test individual components in isolation
- Maintain consistent code formatting with Prettier 