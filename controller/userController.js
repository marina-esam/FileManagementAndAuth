const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const QueryBuilder = require('../utils/QueryBuilder');

exports.createUser = catchAsync(async (req, res) => {
    const newUser = await User.create(req.body);
    res.status(201).json({
        status: 'success',
        data: { user: newUser },
    });
});

exports.getAllUsers = catchAsync(async (req, res) => {
    const features = new QueryBuilder(User.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const users = await features.query;

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: { users },
    });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    await User.findByIdAndDelete(req.params.id);
    res.status(204).json();
});

exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});
