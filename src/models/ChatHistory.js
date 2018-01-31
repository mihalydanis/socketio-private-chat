const mongoose = require('mongoose');

const ChatHistorySchema = mongoose.Schema({
  user: String,
  message: String,
  ts: { type: Date, default: Date.now },
});

const ChatHistory = mongoose.model('ChatHistory', ChatHistorySchema);

module.exports = ChatHistory;
