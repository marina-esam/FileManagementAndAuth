const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
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
});

const File = mongoose.model('File', fileSchema);
module.exports = File;