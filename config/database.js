const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const DB = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/file-management-db';
        const conn = await mongoose.connect(DB);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;