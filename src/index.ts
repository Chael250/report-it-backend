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
    if (!origin || 
        origin === 'https://report-it-frontend.vercel.app' || 
        (process.env.NODE_ENV === 'development' && origin === 'http://localhost:8080')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
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