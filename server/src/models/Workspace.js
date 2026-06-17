const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member',
  },
});

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workspace', workspaceSchema);
