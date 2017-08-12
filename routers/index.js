const signup = require('./signup');
const signin = require('./signin');
const signout = require('./signout');
const posts = require('./posts');
const person = require('./person');
const about = require('./about');

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.locals.indexShowUnderline = true;// 默认显示首页下划线
    return res.redirect('/posts');
  });
  app.use('/signup', signup);
  app.use('/signin', signin);
  app.use('/signout', signout);
  app.use('/posts', posts);
  app.use('/personal', person);
  app.use('/about', about);
  // 404 page
  app.use((req, res) => {
    if (!res.headersSent) {
      res.status(404).render('404');
    }
  });
  // error page
  // 处理所有的最后的消息，包括异常，并返回主页,记录日志
  app.use((err, req, res, next) => {
    // res.status(err.status || 500);
    console.log('发生了错误：', err);
    try {
      return res.redirect('back');
    } catch (e) {
      console.log('最外面一层index的错误处理,错误信息是：', e);
    }
  });
};
