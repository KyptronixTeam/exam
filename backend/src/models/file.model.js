const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  filename: { type: String, required: true, unique: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  path: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  isPublic: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: false });

// Index (already handled by unique: true in field definition)

module.exports = mongoose.model('File', fileSchema);
