module.exports = function (app) {
  app.get('/', function (req, res) {
    res.locals.indexShowUnderline = true;//默认显示首页下划线
    res.redirect('/posts');
  });
  app.use('/signup', require('./signup'));
  app.use('/signin', require('./signin'));
  app.use('/signout', require('./signout'));
  app.use('/posts', require('./posts'));
  // 404 page
  app.use(function (req, res) {
    if (!res.headersSent) {
      res.status(404).render('404');
    }
  });
  // error page
  app.use(function (err, req, res, next) {
    res.render('error', {
      error: err
    });
  });
};