var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin 登录页
router.get('/', checkNotLogin, function(req, res, next) {
  res.render('signin');
});
//检查用户是否存在还有密码问题
router.post('/check',function(req,res,next){

  var name = req.fields.name;
  var password = req.fields.password;
  var message = {
    status:'',
    msg:''
  };
  // 校验参数
  UserModel.getUserByName(name)
    .then(function (user) {
      if (!user) {
        // req.flash('error', '用户不存在');
        message.status = "notvalid";
        message.msg = "用户不存在";
        res.end(JSON.stringify(message));
      }
      // 检查密码是否匹配
      if(!password){
        message.status = "notvalid";
        message.msg = "请输入密码";
        res.end(JSON.stringify(message));
      }
      if (password && sha1(password) !== user.password) {
        // req.flash('error', '用户名或密码错误');
        message.status = "notvalid";
        message.msg = "用户名或密码错误";
        res.end(JSON.stringify(message));
      }

      message.status = "valid";
      res.end(JSON.stringify(message));
    });
});
// POST /signin 用户登录
router.post('/', checkNotLogin, function(req, res, next) {
  var name = req.fields.name;
  var password = req.fields.password;

  UserModel.getUserByName(name)
    .then(function (user) {
      if (user) {
        req.flash('success', '登录成功，欢迎您来到博客家园');
        // 用户信息写入 session
        delete user.password;
        req.session.user = user;
        // 跳转到主页
        res.redirect('/posts');
      }
      
    })
    .catch(next);
});

module.exports = router;