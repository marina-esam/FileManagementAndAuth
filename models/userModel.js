const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide your name!'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide your email address!'],
            unique: true,
            lowercase: true,
            trim: true,
            validate: [validator.isEmail, 'Please provide a valid email address'],
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        password: {
            type: String,
            required: [true, 'Please provide a password!'],
            minlength: [8, 'Password must be at least 8 characters long'],
            select: false,
        },
        passwordResetToken: String,
        passwordResetExpires: Date,
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Session 8: Document Middleware — Hashes password automatically before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Session 8: Query Middleware — Excludes internal __v field from find queries
userSchema.pre(/^find/, function () {
    this.select('-__v');
});

// Instance Method — Compares plain password with stored bcrypt hash
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Session 12 — Creates and stores a hashed password reset token
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;