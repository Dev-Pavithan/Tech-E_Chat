import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  chatName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Chat', chatSchema);
