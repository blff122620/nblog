module.exports = function (app) {
  app.get('/', function (req, res) {
    res.locals.indexShowUnderline = true;//默认显示首页下划线
    return res.redirect('/posts');
  });
  app.use('/signup', require('./signup'));
  app.use('/signin', require('./signin'));
  app.use('/signout', require('./signout'));
  app.use('/posts', require('./posts'));
  app.use('/personal', require('./person'));
  app.use('/about', require('./about'));
  // 404 page
  app.use(function (req, res) {
    if (!res.headersSent) {
      res.status(404).render('404');
    }
  });
  // error page
  //处理所有的最后的消息，包括异常，并返回主页,记录日志
  app.use(function(err, req, res, next) {
    // res.status(err.status || 500);
    console.log('发生了错误：',err);
    try{
      // res.render('index', {
      //   message: err.message,
      //   error: err.message
      // });
      return res.redirect('back');
    }catch(e){
      console.log('最外面一层index的错误处理,错误信息是：',e);
    }
    
  });

  // app.use(function (err, req, res, next) {
  //   // res.render('error', {
  //   //   error: (err?err:{message:'有错误'})
  //   // });
  //   console.log('错误信息:'+err);
  //   res.writeHead(200, {
  //     'Content-Type': 'text/html; charset=utf-8'
  //   });
  //   res.end('<h1 style="display:flex;align-items:center;justify-content:center;height:100%;"><a style="text-decoration:none;" href="/">哎呀，您运气不好，出错了，点我回到主页</a></h1>');
  // });
};