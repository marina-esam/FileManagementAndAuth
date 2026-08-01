const fs = require('fs');
const path = require('path');
const File = require('../models/fileModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

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
    const files = await File.find({ owner: req.user._id });

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

exports.downloadFile = catchAsync(async (req, res, next) => {
    const file = await File.findOne({ _id: req.params.id, owner: req.user._id });

    if (!file) {
        return next(new AppError('No file found with that ID or access denied', 404));
    }

    const filePath = path.resolve(file.path);
    if (!fs.existsSync(filePath)) {
        return next(new AppError('Physical file missing from server storage', 404));
    }

    res.download(filePath, file.originalName);
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

    res.status(204).json({
        status: 'success',
        data: null,
    });
});