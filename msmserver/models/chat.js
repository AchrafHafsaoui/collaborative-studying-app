import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const chatSchema = new Schema({
  identifier: {
    type: String,
    required: true
  },
  messages: [{
    from: String,
    userImage: String,
    messageText: String,
    imageData: String, // Store Base64 image data
    bubble: Number,
    time: String,
    datetime: Date
  }]
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;