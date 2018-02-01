const session = require('express-session');
const RedisStore = require('connect-redis')(session);
require('dotenv').config();

module.exports = (app) => {
  app.use(session({
    store: new RedisStore({
      url: process.env.REDIS_STORE_URI,
    }),
    secret: process.env.REDIS_STORE_SECRET,
    resave: false,
    saveUninitialized: false,
  }));
};
