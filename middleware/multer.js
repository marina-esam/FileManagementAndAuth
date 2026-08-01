const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');

// Configure Disk Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `file-${req.user._id}-${uniqueSuffix}${ext}`);
    },
});

// Optional File Filter (Limits to 10MB per file)
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

module.exports = upload;