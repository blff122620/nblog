var express = require('express');
var utils = require('../lib/utils');
var router = express.Router();

// GET /about 关于我与本站页面显示
router.get('/', function(req, res, next) {
  utils.toggleNav(req,res);//改变导航栏状态
  res.render('about',{
      showDefaultLogo:true
  });
});

module.exports = router;