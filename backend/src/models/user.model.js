const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, sparse: true, unique: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true, trim: true },
  roles: { type: [String], enum: ['user', 'admin'], default: ['user'] },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

// Indexes - (Note: email and phone unique indexes are already created in the field definitions above)

module.exports = mongoose.model('User', userSchema);
