const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { globalLimiter } = require('./middleware/rateLimiter');
const { errorResponse } = require('./utils/response');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Utility Middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Global Rate Limiter
app.use('/api', globalLimiter);

// API Routes
app.use('/api', apiRoutes);

// 404 Route Handler
app.use((req, res) => {
    errorResponse(res, { statusCode: 404, message: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    errorResponse(res, {
        statusCode: err.status || 500,
        message: err.message || 'Internal Server Error'
    });
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`🚀 Recruitment Platform API Server running on port ${PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`====================================================`);
    });
}

module.exports = app;
