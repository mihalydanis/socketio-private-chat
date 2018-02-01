const path = require('path');
const exphbs = require('express-handlebars');

module.exports = (app) => {
  app.engine('.hbs', exphbs({
    defaultLayout: 'layout',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, '../', 'views'),
    partialsDir: path.join(__dirname, '../', 'views'),
    helpers: {
      json(object) {
        return JSON.stringify(object);
      },
    },
  }));
  app.set('view engine', '.hbs');
  app.set('views', path.join(__dirname, '../', 'views'));
};
