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

// GET /signup 注册页
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
        if (!(name.length >= 1 && name.length <= 10)) {
          throw new Error('名字请限制在 1-10 个字符');
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
        // req.flash('error', message);
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
  // var gender = req.fields.gender;
  // var bio = req.fields.bio;
  // var avatar = req.files.avatar.path.split(path.sep).pop();
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
    // gender: gender,
    // bio: bio,
    avatar: avatar
  };
  // 用户信息写入数据库
  UserModel.create(user)
    .then(function (result) {
      // 此 user 是插入 mongodb 后的值，包含 _id
      user = result.ops[0];
      // 将用户信息存入 session
      // delete user.password;
      // req.session.user = user;
      // 写入 flash
      req.flash('success', '注册成功，欢迎您的到来，点击右上方即可登录');
      // 跳转到首页
      res.redirect('/posts');
    })
    .catch(function (e) {
      // 注册失败，异步删除上传的头像
      // fs.unlink(req.files.avatar.path);
      // 用户名被占用则跳回注册页，而不是错误页
      if (e.message.match('E11000 duplicate key')) {
        req.flash('error', '用户名已被占用');
        message.msg = '用户名已被占用';
        res.end(JSON.stringify(message));
        // return res.redirect('/signup');
      }
      next(e);
    });
});

module.exports = router;