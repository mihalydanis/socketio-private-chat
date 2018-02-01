const chat = require('./chat');
const user = require('./user');
const urlErrorHandler = require('./urlErrorHandler');

module.exports = (app) => {
  chat(app);
  user(app);
  urlErrorHandler(app);
};
