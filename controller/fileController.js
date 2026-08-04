const fs = require('fs');
const path = require('path');
const File = require('../models/fileModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const QueryBuilder = require('../utils/QueryBuilder');

exports.uploadFile = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError('Please upload a file!', 400));
    }

    const newFile = await File.create({
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        owner: req.user._id,
    });

    res.status(201).json({
        status: 'success',
        data: { file: newFile },
    });
});

exports.getAllFiles = catchAsync(async (req, res, next) => {
    const baseQuery = File.find({ owner: req.user._id });

    const features = new QueryBuilder(baseQuery, req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const files = await features.query;

    res.status(200).json({
        status: 'success',
        results: files.length,
        data: { files },
    });
});

exports.getFile = catchAsync(async (req, res, next) => {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

    if (!file) {
        return next(new AppError('No file found with that ID or access denied', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { file },
    });
});

exports.deleteFile = catchAsync(async (req, res, next) => {
    const file = await File.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

    if (!file) {
        return next(new AppError('No file found with that ID or access denied', 404));
    }
    const filePath = path.resolve(file.path);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    res.status(204).json({ status: 'success', data: null });
});

// GET /api/v1/files/stats
exports.getFileStats = catchAsync(async (req, res, next) => {
    const stats = await File.aggregate([
        // Stage 1 ($match): Only count files belonging to this user
        { $match: { owner: req.user._id } },

        // Stage 2 ($group): Group by MIME type and compute totals
        {
            $group: {
                _id: '$mimeType',
                count: { $sum: 1 },
                totalBytes: { $sum: '$size' },
                avgBytes: { $avg: '$size' },
                minSize: { $min: '$size' },
                maxSize: { $max: '$size' },
            },
        },

        // Stage 3 ($project): Reshape output and convert bytes to MB
        {
            $project: {
                _id: 0,
                mimeType: '$_id',
                count: 1,
                totalSizeMB: { $round: [{ $divide: ['$totalBytes', 1048576] }, 2] },
                avgSizeMB: { $round: [{ $divide: ['$avgBytes', 1048576] }, 2] },
                minSizeKB: { $round: [{ $divide: ['$minSize', 1024] }, 2] },
                maxSizeKB: { $round: [{ $divide: ['$maxSize', 1024] }, 2] },
            },
        },

        // Stage 4: Sort by total size descending
        { $sort: { totalSizeMB: -1 } },
    ]);

    res.status(200).json({
        status: 'success',
        results: stats.length,
        data: { stats },
    });
});