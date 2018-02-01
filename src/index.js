const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const engine = require('./engine');
const routes = require('./routes');
const middleware = require('./middleware');
const { ChatHistory } = require('./models');
require('dotenv').config();

const port = process.env.PORT || 3001;

http.listen(port, () => {
  mongoose.connect(process.env.DB_URI).catch((err) => {
    console.log(err);
  }).then(() => {
    console.log(`listening on *:${port}`, ', db initialized');
  });
});

engine(app);
middleware(app, express);
routes(app);

const users = {};

io.sockets.on('connection', (socket) => {
  socket.on('sendMessage', (message) => {
    const user = new ChatHistory({
      user: socket.username,
      message,
    });

    user.save((err) => {
      if (err) {
        return console.log(err);
      }
    });
    io.sockets.emit('addMessage', socket.username, message);
  });

  socket.on('join', (username) => {
    socket.username = username;
    users[username] = socket.id;

    const limit = 50;

    ChatHistory.find()
      .limit(limit)
      .sort({ ts: 1 })
      .exec((err, chatHistories) => {
        socket.emit('renderChatHistory', chatHistories);
        socket.emit('systemMessage', 'You have connected');
        socket.broadcast.emit('systemMessage', `${username} has connected`);
        io.sockets.emit('renderUsers', users);
      });
  });

  socket.on('disconnect', () => {
    delete users[socket.username];
    io.sockets.emit('renderUsers', users);
    socket.broadcast.emit('systemMessage', `${socket.username} has disconnected`);
  });
});

module.exports = app;
