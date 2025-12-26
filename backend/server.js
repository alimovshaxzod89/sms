const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet'); // ✅ Xavfsizlik uchun
const mongoSanitize = require('express-mongo-sanitize'); // ✅ NoSQL injection oldini olish
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load env vars FIRST
dotenv.config();

// ✅ Environment variables validation
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'NODE_ENV'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Route files
const authRoutes = require('./routes/authRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const parentRoutes = require('./routes/parentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const classRoutes = require('./routes/classRoutes');
const examRoutes = require('./routes/examRoutes');
const lessonRoutes = require('./routes/lessonRoutes');

const app = express();

// ✅ Security Middleware (BIRINCHI BO'LISHI KERAK)
app.use(helmet()); // HTTP headers xavfsizligi
app.use(mongoSanitize()); // NoSQL injection oldini olish

// ✅ Rate limiting (ROUTE'LARDAN OLDIN)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 100,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 daqiqa
  max: 5,
  message: {
    success: false,
    error: 'Too many login attempts, please try again after 15 minutes'
  },
  skipSuccessfulRequests: true, // ✅ Muvaffaqiyatli login'larni hisobga olmaydi
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/login', loginLimiter);

// Body parser
app.use(express.json({ limit: '10mb' })); // ✅ Limit qo'shamiz
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ CORS - sodda va xavfsiz
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // ✅ Production uchun minimal logging
  app.use(morgan('combined'));
}

// Health check route (BIRINCHI route)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/lessons', lessonRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Error handler (OXIRGI middleware)
app.use(errorHandler);

// Connect to database and start server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Server: http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
      console.log(`🗄️  Database: Connected`);
      console.log(`🔒 Security: Enabled`);
      console.log('=================================');
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} signal received: closing HTTP server`);
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`❌ Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

    // ✅ Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error(`❌ Uncaught Exception: ${err.message}`);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

// ✅ Faqat test muhitida emas bo'lsa server ishga tushadi
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app; // ✅ Testing uchun export qilamiz