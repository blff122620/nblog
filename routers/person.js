var express = require('express');
var router = express.Router();
var utils = require('../lib/utils');
var UserModel = require('../models/users');
var checkLogin = require('../middlewares/check').checkLogin

// GET /personal 个人资料页的显示
router.get('/',checkLogin, function(req, res, next) {
  var underlineCount = utils.toggleNav(req,res);//改变导航栏状态
  
  res.render('personal',{
    date:utils.formatDate(new Date()),
    nicknameSelected : !!underlineCount?true:false
  });
});

module.exports = router;