const express = require('express');

const router = express.Router();

const checkLogin = require('../middlewares/check').checkLogin;

// GET /signout 登出
router.get('/', checkLogin, (req, res, next) => {
  // 清空 session 中用户信息
  req.session.user = null;
  req.flash('success', '登出成功，欢迎您下次再来');
  // 登出成功后跳转到主页
  return res.redirect('/posts');
});

module.exports = router;
