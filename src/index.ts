import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from './generated/prisma';
import complaintRoutes from './routes/complaints';
import agencyRoutes from './routes/agencies';

// Initialize Prisma client with error handling
let prisma: PrismaClient;
try {
  prisma = new PrismaClient();
  console.log('Prisma client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  process.exit(1);
}

// Add shutdown handler
process.on('SIGTERM', async () => {
  try {
    await prisma.$disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
  process.exit(0);
});

// Add error handler for Prisma
process.on('unhandledRejection', async (error) => {
  console.error('Unhandled rejection:', error);
  try {
    await prisma.$disconnect();
  } catch (disconnectError) {
    console.error('Error disconnecting:', disconnectError);
  }
  process.exit(1);
});

// Add uncaught exception handler
process.on('uncaughtException', async (error) => {
  console.error('Uncaught exception:', error);
  try {
    await prisma.$disconnect();
  } catch (disconnectError) {
    console.error('Error disconnecting:', disconnectError);
  }
  process.exit(1);
});

// Verify database connection
async function verifyDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection verified successfully');
  } catch (error) {
    console.error('Failed to verify database connection:', error);
    process.exit(1);
  }
}

// Verify API routes
async function verifyApiRoutes() {
  try {
    // Test routes
    const testComplaint = await prisma.complaint.create({
      data: {
        title: 'Test Complaint',
        description: 'This is a test complaint',
        category: 'test',
        agencyId: 1
      }
    });
    console.log('Test complaint created:', testComplaint);
    
    const testAgency = await prisma.agency.create({
      data: {
        name: 'Test Agency'
      }
    });
    console.log('Test agency created:', testAgency);
  } catch (error) {
    console.error('Failed to verify API routes:', error);
    process.exit(1);
  }
}

const app = express();
const PORT: number | string = process.env.PORT || 3000;

// Add detailed request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} from ${req.headers.origin}`);
  console.log('Headers:', req.headers);
  next();
});

// Add error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Request error:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    error: err
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// Add 404 handler
app.use((req, res) => {
  console.error('404 Not Found:', req.url);
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource could not be found',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/agencies', agencyRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'production'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      error: 'Database connection failed'
    });
  }
});

// Start server
const startServer = async () => {
  try {
    // Verify database connection
    await verifyDatabaseConnection();
    
    // Verify API routes
    await verifyApiRoutes();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
      console.log(`Database URL: ${process.env.DATABASE_URL || 'Not set'}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    // Handle server listening
    server.on('listening', () => {
      console.log('Server is listening');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Middleware
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    console.log('CORS request from:', origin);
    if (!origin || 
        origin === 'https://report-it-frontend.vercel.app' || 
        (process.env.NODE_ENV === 'development' && origin === 'http://localhost:8080')) {
      console.log('CORS allowed for:', origin);
      callback(null, true);
    } else {
      console.log('CORS denied for:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 3600,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({ status: 'error', error: 'Database connection failed' });
  }
});

// CORS preflight response
app.options('*', cors(corsOptions));

app.use(cors(corsOptions));

// Add detailed request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} from ${req.headers.origin}`);
  next();
});

// Add error handler
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Add 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Add CORS preflight response
app.options('*', cors(corsOptions));

app.use(cors(corsOptions));

// Add detailed request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} from ${req.headers.origin}`);
  next();
});

// Add error handler
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/agencies', agencyRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});