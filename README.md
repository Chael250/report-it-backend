# Report-It Backend

This is the backend repository for the Report-It citizen complaint management system. It's built with Node.js, Express, and PostgreSQL, providing a RESTful API for complaint management.

## Features

- RESTful API endpoints for complaints and agencies
- PostgreSQL database integration
- Prisma ORM for database operations
- Authentication and authorization
- Input validation and error handling
- CORS support

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```

3. Copy and configure environment variables
   ```bash
   cp .env.example .env
   ```

4. Run database migrations
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

## Deployment

### Render Deployment

1. **Prerequisites**
   - Render account
   - PostgreSQL database on Render
   - Git repository

2. **Setup PostgreSQL on Render**
   - Create a new PostgreSQL database
   - Note down the connection string
   - Set up a database user with appropriate permissions

3. **Deploy Backend**
   ```bash
   # 1. Install dependencies
   npm install

   # 2. Run database migrations
   npx prisma migrate deploy

   # 3. Build TypeScript
   npm run build
   ```

4. **Deploy to Render**
   - Create a new Web Service on Render
   - Connect your Git repository
   - Set build command: `npm run build`
   - Set start command: `npm start`
   - Add environment variables:
     - `DATABASE_URL` (from your Render PostgreSQL)
     - `NODE_ENV=production`
     - `PORT=3000`

5. **Render Configuration**
   - Set up automatic deploys from your main branch
   - Configure SSL/TLS
   - Set up environment variables in Render dashboard

### Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL=your-postgres-url
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secret-key
```

## API Documentation

### Complaints

- `GET /api/complaints` - List all complaints
- `GET /api/complaints/:id` - Get a specific complaint
- `POST /api/complaints` - Create a new complaint
- `PUT /api/complaints/:id` - Update a complaint
- `DELETE /api/complaints/:id` - Delete a complaint

### Agencies

- `GET /api/agencies` - List all agencies
- `GET /api/agencies/:id` - Get a specific agency
- `POST /api/agencies` - Create a new agency
- `PUT /api/agencies/:id` - Update an agency
- `DELETE /api/agencies/:id` - Delete an agency

## Project Structure

```
src/
├── routes/        # API routes
├── controllers/   # Request handlers
├── services/      # Business logic
├── middleware/    # Custom middleware
├── utils/         # Utility functions
└── generated/     # Prisma generated files
```

## Development

### Available Scripts

In the project directory, you can run:

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Run database migrations
npm run prisma:migrate
```

### Development Best Practices

1. **Code Style**
   - Follow ESLint rules
   - Use TypeScript for type safety
   - Maintain consistent API structure

2. **Database**
   - Use Prisma migrations for schema changes
   - Implement proper error handling
   - Use transactions for complex operations

3. **Error Handling**
   - Implement proper error responses
   - Use consistent error formats
   - Log errors appropriately

## Security

1. **Authentication**
   - JWT-based authentication
   - Secure password hashing
   - Rate limiting

2. **Authorization**
   - Role-based access control
   - Resource permissions
   - API key validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- Node.js
- Express
- PostgreSQL
- Prisma
- Render
- TypeScript
