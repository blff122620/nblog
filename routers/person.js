var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var utils = require('../lib/utils');
var UserModel = require('../models/users');
var checkLogin = require('../middlewares/check').checkLogin

// GET /personal 个人资料页的显示
router.get('/',checkLogin, function(req, res, next) {
  var underlineCount = utils.toggleNav(req,res);//改变导航栏状态
  var author = req.session.user;

  UserModel.getUserById(author._id)
    .then(function (user) {
      if(user){
        req.session.user = user;
        res.render('personal',{
          date:utils.formatDate(new Date()),
          nicknameSelected : !!underlineCount?true:false,
          authorName: req.session.user.nickname,
          user:user
        });
      }
      
    })
    .catch(next);
  
});

// POST /personal 用户更新资料
router.post('/', checkLogin, function(req, res, next) {
  var userId = req.fields.userid;
  var nickname = req.fields.nickname;
  var topimg = req.fields.topimg;
  var info = req.fields.info;
  var avatar = req.files.avatar.path.split(path.sep).pop();
  var email = req.fields.email;

  // 校验参数
  try {
    if (!(nickname.length >= 1 && nickname.length <= 10)) {
      throw new Error('名字请限制在 1-9 个字符');
    }
    // if (!req.files.avatar.name) {
    //   throw new Error('缺少头像');
    // }
    if(req.files.avatar.size>100*1024){
      throw new Error('文件过大，请不要超过100k');
    }
    var type = ['.gif','.jpg','.jpeg','.png'];
    var filename = req.files.avatar.name;
    if(!type.includes(filename.slice(filename.lastIndexOf('.')).toLowerCase())){
        throw new Error("文件类型不匹配，请上传如下类型后缀的文件: "+type.join(" "));
    }
    
  } catch (e) {
    // 失败，异步删除上传的头像
    fs.unlink(req.files.avatar.path);
    req.flash('error', e.message);
    return res.redirect('/personal');
  }

  // 待写入数据库的用户信息
  var user = {
    nickname: nickname,
    topimg: topimg,
    info: info,
    email: email,
    avatar: avatar
  };
  // 用户信息写入数据库
    UserModel.updateUserById(userId, { 
      nickname: nickname, 
      topimg: topimg,
      info:info,
      avatar: avatar,
      email:email
    })
    .then(function () {
      req.flash('success', '个人资料编辑成功');
      // 编辑成功后跳转到上一页
      res.redirect('/personal');
    })
    .catch(next);
});

module.exports = router;