const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const signToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken({ id: user._id, role: user.role });
    // Hide password from output
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user },
    });
};

exports.signUp = catchAsync(async (req, res, next) => {
    const { firstName, lastName, email, password, phone, age, gender, username } =
        req.body;

    const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        phone,
        age,
        gender,
        username,
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
        return next(new AppError('Please provide email and password', 400));

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
        return next(new AppError('Wrong email or password', 401));

    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    if (
        !req.headers.authorization ||
        !req.headers.authorization.startsWith('Bearer')
    ) {
        return next(
            new AppError('You are not logged in, please login first', 401)
        );
    }

    const token = req.headers.authorization.split(' ')[1];
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError('This user no longer exists', 404));

    req.user = user;
    next();
});

// POST /api/v1/auth/forgotPassword   { email }
exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Find user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user)
        return next(new AppError('No user found with that email address', 404));

    // 2) Generate a plain reset token and save the hashed version to DB
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Build the reset URL to send in the email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;

    const message =
        `You requested a password reset.\n\n` +
        `Click the link below to set a new password (valid for 10 minutes):\n\n` +
        `${resetURL}\n\n` +
        `If you did not request this, please ignore this email.`;

    try {
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Token (valid for 10 minutes)',
            text: message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Reset token sent to email',
        });
    } catch (err) {
        // If email fails, clear the token fields so the user can try again
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError('There was an error sending the email. Try again later.', 500)
        );
    }
});

// PATCH /api/v1/auth/resetPassword/:token   { password }
exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Hash the plain token from the URL to compare with the stored hash
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    // 2) Find the user whose token matches AND has not yet expired
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user)
        return next(new AppError('Token is invalid or has expired', 400));

    // 3) Set the new password and clear the reset token fields
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save(); // triggers the pre('save') bcrypt middleware

    // 4) Log the user in with a fresh JWT
    createSendToken(user, 200, res);
});
