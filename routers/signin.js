const sha1 = require('sha1');

const express = require('express');

const router = express.Router();

const UserModel = require('../models/users');

const checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin 登录页
router.get('/', checkNotLogin, (req, res, next) => {
  res.render('signin');
});
// 检查用户是否存在，密码验证
router.post('/check', (req, res, next) => {
  const name = req.fields.name;
  const password = req.fields.password;
  const message = {
    status: '',
    msg: '',
  };
  // 校验参数
  UserModel.getUserByName(name)
    .then((user) => {
      if (!user) {
        message.status = 'notvalid';
        message.msg = '用户不存在';
        res.end(JSON.stringify(message));
      }
      // 检查密码是否匹配
      if (!password) {
        message.status = 'notvalid';
        message.msg = '请输入密码';
        res.end(JSON.stringify(message));
      }
      if (user) {
        if (!!password && sha1(password) !== user.password) {
          message.status = 'notvalid';
          message.msg = '用户名或密码错误';
          res.end(JSON.stringify(message));
        }
      }
      message.status = 'valid';
      res.end(JSON.stringify(message));
    });
});
// POST /signin 用户登录
router.post('/', checkNotLogin, (req, res, next) => {
  const name = req.fields.name;
  const password = req.fields.password;

  UserModel.getUserByName(name)
    .then((user) => {
      if (user) {
        req.flash('success', '登录成功，欢迎您来到博客家园');
        // 用户信息写入 session
        delete user.password;
        req.session.user = user;
        // 跳转到我的文章
        return res.redirect(`/posts?author=${user._id}`);
      }
      return res.redirect('back');
    })
    .catch(next);
});

module.exports = router;
