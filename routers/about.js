const express = require('express');

const utils = require('../lib/utils');

const router = express.Router();

// GET /about 关于我与本站页面显示
router.get('/', (req, res, next) => {
  utils.toggleNav(req, res);// 改变导航栏状态
  res.render('about', {
    showDefaultLogo: true,
  });
});

module.exports = router;
