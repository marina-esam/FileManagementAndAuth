/**
 * seed.js — Session 5: Seeding databases using process.argv
 *
 * Usage:
 *   node seed.js --import    →  Insert sample users and files into MongoDB
 *   node seed.js --delete    →  Wipe all users and files from MongoDB
 */

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const File = require('./models/fileModel');

dotenv.config({ path: './.env' });

// ── Connect to MongoDB ────────────────────────────────────────────────────────
const DB = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/file-management-db';

mongoose
    .connect(DB)
    .then(() => console.log('✅ DB connection successful for seeding'))
    .catch((err) => {
        console.error('❌ DB connection failed:', err.message);
        process.exit(1);
    });

// ── Sample Data ───────────────────────────────────────────────────────────────
const sampleUsers = [
    {
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'password123',
        role: 'admin',
    },
    {
        name: 'Bob Jones',
        email: 'bob@example.com',
        password: 'password123',
        role: 'user',
    },
    {
        name: 'Marina Esam',
        email: 'marina@example.com',
        password: 'password123',
        role: 'user',
    },
];

// ── Import Data ───────────────────────────────────────────────────────────────
const importData = async () => {
    try {
        // User.create will trigger pre('save') → passwords will be hashed automatically
        const createdUsers = await User.create(sampleUsers);
        console.log(`✅ ${createdUsers.length} users seeded successfully`);

        // Create sample file records linked to the first user
        const sampleFiles = [
            {
                filename: 'sample-report.pdf',
                originalName: 'Annual Report 2025.pdf',
                mimeType: 'application/pdf',
                size: 2048000,  // ~2 MB
                path: './uploads/sample-report.pdf',
                owner: createdUsers[0]._id,
            },
            {
                filename: 'profile-photo.png',
                originalName: 'my_photo.png',
                mimeType: 'image/png',
                size: 512000,   // ~0.5 MB
                path: './uploads/profile-photo.png',
                owner: createdUsers[1]._id,
            },
            {
                filename: 'notes.txt',
                originalName: 'session_notes.txt',
                mimeType: 'text/plain',
                size: 1024,     // 1 KB
                path: './uploads/notes.txt',
                owner: createdUsers[0]._id,
            },
        ];

        await File.create(sampleFiles);
        console.log(`✅ ${sampleFiles.length} files seeded successfully`);

        console.log('🎉 Database seeded! Exiting...');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding data:', err.message);
        process.exit(1);
    }
};

// ── Delete All Data ───────────────────────────────────────────────────────────
const deleteData = async () => {
    try {
        await User.deleteMany();
        await File.deleteMany();
        console.log('✅ All data deleted from database');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error deleting data:', err.message);
        process.exit(1);
    }
};

// ── Read process.argv ─────────────────────────────────────────────────────────
const arg = process.argv[2];

if (arg === '--import') {
    importData();
} else if (arg === '--delete') {
    deleteData();
} else {
    console.log('Usage:');
    console.log('  node seed.js --import   → seed sample data');
    console.log('  node seed.js --delete   → wipe all data');
    process.exit(0);
}
