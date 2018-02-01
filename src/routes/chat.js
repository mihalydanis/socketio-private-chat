function showChat(req, res) {
  if (req.session.key) {
    res.render('chat/index', {
      username: req.session.key,
      layout: 'chat/layout',
    });
  } else {
    res.redirect('/');
  }
}

module.exports = (app) => {
  app.get('/chat', showChat);
};
