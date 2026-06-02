const mongoose = require('mongoose');
const { User } = require('./src/models');
const { hashPassword } = require('./src/services/password.service');
const { connectDatabase } = require('./src/config/database');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await connectDatabase();
    console.log('Connected to database...');

    const email = 'admin@gmail.com';
    const password = '12345678';

    let admin = await User.findOne({ email });
    
    if (admin) {
      console.log(`User ${email} already exists. Updating password and roles...`);
      admin.password = await hashPassword(password);
      admin.roles = ['admin'];
      await admin.save();
      console.log('Admin user updated successfully.');
    } else {
      console.log(`Creating new admin user ${email}...`);
      const hashedPassword = await hashPassword(password);
      admin = new User({
        email,
        password: hashedPassword,
        fullName: 'Gourav Admin',
        roles: ['admin']
      });
      await admin.save();
      console.log('Admin user created successfully.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
