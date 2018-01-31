const express = require('express');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
require('dotenv').config();

const { ChatHistory } = require('./models');

const port = process.env.PORT || 3001;

http.listen(port, () => {
  mongoose.connect(process.env.DB_URI).catch((err) => {
    console.log(err);
  }).then(() => {
    console.log(`listening on *:${port}`, `db initialized`);
  });
});

app.engine('.hbs', exphbs({
  defaultLayout: 'layout',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views'),
  partialsDir: path.join(__dirname, 'views'),
  helpers: {
    json(object) {
      return JSON.stringify(object);
    },
  },
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(session({
  store: new RedisStore({
    url: process.env.REDIS_STORE_URI,
  }),
  secret: process.env.REDIS_STORE_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.get('/', (req, res) => {
  if (req.session.key) {
    res.redirect('/profile');
  } else {
    res.render('login');
  }
});

app.get('/profile', (req, res) => {
  if (req.session.key) {
    res.render('profile', {
      username: req.session.key,
    });
  } else {
    res.redirect('/');
  }
});

app.post('/login', (req, res) => {
  req.session.key = req.body.username;
  res.redirect('/profile');
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
});

app.get('/chat', (req, res) => {
  res.render('chat/index', {
    username: req.session.key,
    layout: 'chat/layout',
  });
});

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
    io.sockets.emit('updateChat', socket.username, message);
  });

  socket.on('join', (username) => {
    socket.username = username;
    users[username] = socket.id;

    const limit = 50;

    ChatHistory.find()
      .limit(limit)
      .sort({ ts: -1 })
      .exec((err, chatHistories) => {
        socket.emit('updateChat', 'SERVER', `Showing the latest ${limit} messages`);
        socket.emit('updateChatHistory', chatHistories);
        socket.emit('updateChat', 'SERVER', 'You have connected');
        socket.broadcast.emit('updateChat', 'SERVER', `${username} has connected`);
        io.sockets.emit('updateUsers', users);
      });
  });

  socket.on('disconnect', () => {
    delete users[socket.username];
    io.sockets.emit('updateUsers', users);
    socket.broadcast.emit('updateChat', 'SERVER', `${socket.username} has disconnected`);
  });
});

app.use((req, res) => {
  res.status(404);
  if (req.accepts('json')) {
    res.send('Page not found');
  }
});

module.exports = app;
