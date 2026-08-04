const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, 'Please provide your first name!'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Please provide your last name!'],
            trim: true,
        },
        username: {
            type: String,
            required: [true, 'Please provide a username!'],
            unique: true,
            trim: true,
            lowercase: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide your email address!'],
            unique: true,
            lowercase: true,
            trim: true,
            validate: [validator.isEmail, 'Please provide a valid email address'],
        },
        phone: {
            type: String,
            trim: true,
        },
        age: {
            type: Number,
            min: [1, 'Age must be a positive number'],
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
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

userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.pre(/^find/, function (next) {
    this.select('-__v');
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
    // 1) Generate a random plain token (sent to user's email)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2) Hash it and store the hash (never store plain tokens in DB)
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // 3) Token expires in 10 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    // Return the plain token so it can be emailed
    return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;