import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import userRoutes from './routes/userRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { rateLimiter } from './middlewares/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware: Helmet with customized CSP to allow Google Fonts, Unsplash images
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.appspot.com", "*"],
      connectSrc: ["'self'", "*"]
    }
  }
}));

// Apply global base rate limiter
app.use(rateLimiter(false));

app.use(cors({
  origin: '*', // For hackathon demonstration, we accept all origins. In production, restrict this.
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request Logging
app.use(morgan('dev'));

// Payload Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Community Hero Backend is Running 🚀",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

// 2. Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 3. API Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    api: "Community Hero API",
    status: "Running"
  });
});

// Mounting Routing Modules
app.use('/api/users', userRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboards', dashboardRoutes);

// 4. 404 Fallback for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Path not found: ${req.originalUrl}`
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Process-level crash protectors (Unhandled exceptions/rejections)
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Community Hero Server listening on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
