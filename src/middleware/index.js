const assets = require('./assets');
const bodyParser = require('./bodyParser');
const redis = require('./redis');

module.exports = (app, express) => {
  assets(app, express);
  bodyParser(app);
  redis(app);
};
