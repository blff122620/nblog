module.exports = function (app) {
  app.get('/', function (req, res) {
    res.locals.indexShowUnderline = true;//默认显示首页下划线
    res.redirect('/posts');
  });
  app.use('/signup', require('./signup'));
  app.use('/signin', require('./signin'));
  app.use('/signout', require('./signout'));
  app.use('/posts', require('./posts'));
};