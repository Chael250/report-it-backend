import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import complaintRoutes from './routes/complaints';
import agencyRoutes from './routes/agencies';

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
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  maxAge: 3600,
  preflightContinue: false
};

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