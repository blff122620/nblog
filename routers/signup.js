var fs = require('fs'),
  path = require('path'),
  sha1 = require('sha1'),
  express = require('express'),
  router = express.Router(),
  expireTime = 120000, //120s,验证码过期时间
  btoa = require('btoa'),
  captcha = require('hahoo-captcha');

var UserModel = require('../models/users'),
  checkNotLogin = require('../middlewares/check').checkNotLogin,
  utils = require('../lib/utils');
// GET /signup 注册页
router.get('/', checkNotLogin, function(req, res, next) {
  res.render('signup');
});

// GET /identifycode 注册页
router.get('/identifycode', checkNotLogin, function(req, res, next) {
  var guid = utils.guid(),//唯一标示
    now = Date.now();
  captcha.default.toBuffer() //生成验证码
    .then((data) => {
      console.log(data.text);
      global.identifyCodes[guid] = {
        text:data.text, //验证码文本
        createdTime:now //创建时间
      };
      //遍历验证码，删除超时的验证码
      for(var key in global.identifyCodes){
        if((now - global.identifyCodes[key].createdTime) > expireTime){
          delete global.identifyCodes[key];
        }
      }
      res.end(JSON.stringify({
        guid: guid,
        base64: 'data:image/png;base64,' + btoa(String.fromCharCode.apply(null, data.buffer))   
      }));
      
    })
    .catch((err) => {
      console.log(err);
    });
});

// GET /signup/check 校验注册参数
router.post('/check', function(req, res, next) {
  var name = req.fields.name,
    nickname = req.fields.nickname,
    password = req.fields.password,
    repassword = req.fields.repassword,
    identifycode = req.fields.identifycode,
    guid = req.fields.guid,
    message = {
      status:'',
      msg:''
    },
    existUser = false;
  
  // 校验参数
  UserModel.getUserByName(name)
    .then(function (user) {
      if (user) {
        existUser = true;
      }
      try {
        if (name.length === 0 ) {
          throw new Error('请输入用户名');
        }
        if (nickname.length === 0 ) {
          throw new Error('请输入昵称');
        }
        if (name.trim().length === 0 ) {
          throw new Error('用户名不能用空白符');
        }
        if (nickname.trim().length === 0 ) {
          throw new Error('昵称不能用空白符');
        }
        if (!(name.length >= 1 && name.length <= 10)) {
          throw new Error('用户名请限制在 1-10 个字符');
        }
        
        if(existUser){
          throw new Error('用户名已经存在');
        }

        if (password.length < 6) {
          throw new Error('密码至少 6 个字符');
        }
        if (password !== repassword) {
          throw new Error('两次输入密码不一致');
        }
        idCode = global.identifyCodes[guid];
        if(idCode){
          if((Date.now() - idCode.createdTime) > expireTime){
            //验证码超过过期时间,删除验证码
            delete global.identifyCodes[guid];
            throw new Error('验证码过期，请点击验证码');
          }
          else{
            if(idCode.text.toLowerCase() == identifycode.toLowerCase()){//验证通过，删除验证码，允许注册
              delete global.identifyCodes[guid];
            }
            else{
              throw new Error('验证码错误，请重新输入');
            }
          }  
        }
        else{//不存在该验证码
          throw new Error('验证码不存在，请点击验证码刷新');
        }
      } catch (e) {
        // 注册失败
        message.msg = e.message;
        message.status = "notvalid";
        res.end(JSON.stringify(message));
      }

      message.status = "valid";
      res.end(JSON.stringify(message));
    });

  
});

// POST /signup 用户注册
router.post('/', checkNotLogin, function(req, res, next) {
  
  var name = req.fields.name;
  var nickname = req.fields.nickname;
  var avatar = 'avatar_default.jpg'
  var password = req.fields.password;
  var repassword = req.fields.repassword;
  var message = {
    msg:''
  };

  // 明文密码加密
  password = sha1(password);
  
  // 待写入数据库的用户信息
  var user = {
    name: name,
    nickname:nickname,
    password: password,
    avatar: avatar,
    topimg:[req.protocol + ':/' ,req.get('host'),'img/header_bg_default.jpg'].join('/')
  };
  // 用户信息写入数据库
  UserModel.create(user)
    .then(function (result) {
      // 此 user 是插入 mongodb 后的值，包含 _id
      user = result.ops[0];
      // 将用户信息存入 session
      delete user.password;
      req.session.user = user;
      // 写入 flash
      req.flash('success', '注册成功，欢迎您的到来，您已成功登录');
      // 跳转到我的文章页面
      return res.redirect('/posts?author='+user._id);
    })
    .catch(function (e) {
      // 注册失败
      // 用户名被占用则返回相应信息
      if (e.message.match('E11000 duplicate key')) {
        
        message.msg = '用户名已被占用';
        res.end(JSON.stringify(message));
    
      }
      next(e);
    });
});

module.exports = router;