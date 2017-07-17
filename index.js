var path = require('path'),
    express = require('express'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    flash = require('connect-flash'),
    config = require('config-lite')(__dirname),
    routers = require('./routers'),
    pkg = require('./package'),
    winston = require('winston'),
    expressWinston = require('express-winston');

require('events').EventEmitter.defaultMaxListeners = Infinity;

var app = express();

// 设置模板目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
// session 中间件
app.use(session({
  name: config.session.key,// 设置 cookie 中保存 session id 的字段名称
  secret: config.session.secret,// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  resave: true,// 强制更新 session
  saveUninitialized: false,// 设置为 false，强制创建一个 session，即使用户未登录
  cookie: {
    maxAge: config.session.maxAge// 过期时间，过期后 cookie 中的 session id 自动删除
  },
  store: new MongoStore({// 将 session 存储到 mongodb
    url: config.mongodb// mongodb 地址
  })
}));
// flash 中间件，用来显示通知
app.use(flash());

// 处理表单及文件上传的中间件
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img/upload'),// 上传文件目录
  keepExtensions: true,// 保留后缀
  maxFileSize:100*1024
}));

// 设置模板全局常量
app.locals.blog = {
  // title: pkg.name,
  title: '幽忧志 - Hello World',
  description: pkg.description
};

// 添加模板必需的变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.success = req.flash('success').toString();
  res.locals.error = req.flash('error').toString();
  res.locals.authorName = "";//logo的名字
  res.locals.nicknameSelected = false;
  res.locals.authorId = '';
  res.locals.authorTopimg = '';
  res.locals.authorAvatar = '';
  res.locals.showDefaultLogo = false;//显示默认的网站logo
  res.locals.nav = [
    {
      href:'/posts',
      value:'主页',
      selected:true,
      display:true
    },
    {
      href:'/posts?archive=1',
      value:'归档',
      selected:false,
      display:true
    },
    {
      href:res.locals.user?'/posts?author=' + res.locals.user._id:'/',
      value:'我的文章',
      selected:false,
      display:res.locals.user,
      inMore:true
    },
    {
      href:res.locals.user?'/posts?archive=1&author=' + res.locals.user._id:'/posts?archive=1',
      value:'我的归档',
      selected:false,
      display:res.locals.user,
      inMore:true //是否在更多下拉列表，不会显示在主导航
    },
    {
      href:'/posts/publisher',
      value:'发表文章',
      selected:false,
      display:res.locals.user
    },
    {
      href:'/personal/users',
      value:'博主们',
      selected:false,
      display:true
    },
    {
      href:'',
      value:'立即登录',
      addClass:'js-login-button',
      selected:false,
      display:!res.locals.user
    },
    {
      href:'',
      value:'免费注册',
      addClass:'js-reg-button',
      selected:false,
      display:!res.locals.user
    },
    
    {
      href:'/about',
      value:'关于',
      selected:false,
      display:true
    }
  ];
  next();
});

// 正常请求的日志
app.use(expressWinston.logger({
  transports: [
    // new (winston.transports.Console)({
    //   json: true,
    //   colorize: true
    // }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}));
// 路由
routers(app);
// 错误请求的日志
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}));

//处理所有的最后的消息，包括异常，并返回主页
app.use(function(err, req, res, next) {
  // res.status(err.status || 500);
  try{
    // res.render('index', {
    //   message: err.message,
    //   error: err.message
    // });
    res.redirect('back');
  }catch(e){
    console.log('最外面一层index的错误处理,错误信息是：',e)
  }
  
});

// 监听端口，启动程序
app.listen(config.port, function () {
  console.log(`${pkg.name} listening on port ${config.port}`);
});



