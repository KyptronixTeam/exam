// Seed script to create admin user
// Run with: node src/scripts/seed-admin.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/exam';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, sparse: true, unique: true, trim: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    roles: { type: [String], enum: ['user', 'admin'], default: ['user'] },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'tirtho.kyptronix@gmail.com';
        const adminPassword = '1234';

        // Check if admin already exists
        let admin = await User.findOne({ email: adminEmail });

        if (admin) {
            console.log('Admin user already exists, updating password and roles...');
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            admin.password = hashedPassword;
            admin.roles = ['admin'];
            admin.fullName = 'Admin User';
            await admin.save();
            console.log('Admin user updated successfully!');
        } else {
            console.log('Creating new admin user...');
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            admin = await User.create({
                email: adminEmail,
                password: hashedPassword,
                fullName: 'Admin User',
                roles: ['admin'],
                isActive: true
            });
            console.log('Admin user created successfully!');
        }

        console.log('\nAdmin credentials:');
        console.log('  Email:', adminEmail);
        console.log('  Password:', adminPassword);

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
}

seedAdmin();
