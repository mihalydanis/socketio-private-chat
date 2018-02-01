function showChat(req, res) {
  res.render('chat/index', {
    username: req.session.key,
    layout: 'chat/layout',
  });
}

module.exports = (app) => {
  app.get('/chat', showChat);
};
