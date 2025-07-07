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
│   └── users.json          # User authentication data
├── routes/                  # Route handlers
│   ├── fields.js           # Fields endpoints
│   ├── featured.js         # Featured fields endpoints
│   ├── locations.js        # Location endpoints
│   ├── bookings.js         # Booking endpoints
│   └── auth.js             # Authentication endpoints
├── services/               # Business logic
│   └── dataService.js      # Data loading and management
├── config/                 # Configuration files
│   └── swagger.js          # Swagger/OpenAPI configuration
├── index.js                # Main application file
└── package.json
```

## Features

- **Modular Architecture**: Separated routes, services, and data
- **JSON Data Storage**: All example data stored in separate JSON files
- **Caching**: Data service caches loaded JSON files for performance
- **Error Handling**: Proper error responses for all endpoints
- **CORS Support**: Configured for frontend development
- **Security**: Helmet middleware for security headers
- **API Documentation**: Interactive Swagger/OpenAPI documentation

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

## Data Organization

All example data is stored in JSON files in the `data/` directory:

- **fields.json**: Contains paginated field listings
- **field-details.json**: Detailed information for each field
- **filters.json**: Available filter options
- **featured-fields.json**: Featured/promoted fields
- **locations.json**: Location data for autocomplete
- **users.json**: User accounts for authentication

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. The API will be available at `http://localhost:8000`

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