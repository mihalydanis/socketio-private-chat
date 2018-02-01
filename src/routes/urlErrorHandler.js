module.exports = (app) => {
  app.use((req, res) => {
    res.status(404);
    if (req.accepts('json')) {
      res.send('Page not found');
    }
  });
};
