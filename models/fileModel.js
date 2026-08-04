const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
    {
        filename: {
            type: String,
            required: [true, 'A file must have a stored filename'],
        },
        originalName: {
            type: String,
            required: [true, 'A file must have an original filename'],
        },
        mimeType: {
            type: String,
            required: [true, 'A file must have a MIME type'],
        },
        size: {
            type: Number,
            required: [true, 'A file must have a size in bytes'],
        },
        path: {
            type: String,
            required: [true, 'A file must have a local file path'],
        },
        owner: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'A file must belong to a user'],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

fileSchema.virtual('sizeInMB').get(function () {
    return (this.size / (1024 * 1024)).toFixed(2) + ' MB';
});

fileSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'owner',
        select: 'firstName lastName email',
    });
    next();
});

const File = mongoose.model('File', fileSchema);
module.exports = File;