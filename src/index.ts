import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { PrismaClient } from './generated/prisma';
import complaintRoutes from './routes/complaints';
import agencyRoutes from './routes/agencies';

// Initialize Prisma client
const prisma = new PrismaClient();

// Add shutdown handler
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Add error handler for Prisma
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

// Add uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

const app = express();
const PORT: number | string = process.env.PORT || 3000;

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