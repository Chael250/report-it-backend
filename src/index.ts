import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import complaintRoutes from './routes/complaints';
import agencyRoutes from './routes/agencies';

const app = express();
const PORT: number | string = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'https://report-it-frontend.vercel.app',
  credentials: true
}));

// Also allow localhost for development
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true
  }));
}
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