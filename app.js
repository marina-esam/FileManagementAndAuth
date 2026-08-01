const express = require('express');
const path = require('path');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middleware/errorHandler');

const authRouter = require('./routes/authRoutes');
const fileRouter = require('./routes/fileRoutes');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/files', fileRouter);

// Handle Unhandled Routes
app.all('{*any}', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;