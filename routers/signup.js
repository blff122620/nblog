var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup 注册页
router.get('/', checkNotLogin, function(req, res, next) {
  res.render('signup');
});

// GET /signup/check 校验注册参数
router.post('/check', function(req, res, next) {
  var name = req.fields.name;
  var nickname = req.fields.nickname;
  var password = req.fields.password;
  var repassword = req.fields.repassword;
  var message = {
    status:'',
    msg:''
  };
  var existUser = false;
  
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