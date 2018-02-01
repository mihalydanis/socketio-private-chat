function redirectToProfile(req, res) {
  if (req.session.key) {
    res.redirect('/profile');
  } else {
    res.render('login');
  }
}

function login(req, res) {
  console.log('bejotttem');
  req.session.key = req.body.username;
  res.redirect('/profile');
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/');
    }
  });
}

function showProfile(req, res) {
  if (req.session.key) {
    res.render('profile', {
      username: req.session.key,
    });
  } else {
    res.redirect('/');
  }
}

module.exports = (app) => {
  app.get('/', redirectToProfile);
  app.post('/login', login);
  app.get('/logout', logout);
  app.get('/profile', showProfile);
};
