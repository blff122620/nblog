var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var utils = require('../lib/utils');
var UserModel = require('../models/users');
var SessionModel = require('../models/sessions');
var checkLogin = require('../middlewares/check').checkLogin

// GET /personal/info 个人资料
router.get("/info",function(req,res,next){
  var underlineCount = utils.toggleNav(req,res);//改变导航栏状态
  var userid ;
  var authorAvatar = '';
  if(req.query.author != (req.session.user?req.session.user._id:'')){
    underlineCount = true;//处理author不是本人，那么不改变导航栏状态
  }
  if(req.query.author){
    userid = req.query.author;
  }
  else if(req.session.user){
    userid = req.session.user._id;
    
  }else{
    return res.redirect('back');
  }
  UserModel.getUserById(userid)
    .then(function (user) {
      if(user){
        res.render('person',{
          userinfo:user,
          authorName:user.nickname,
          nicknameSelected : !underlineCount?true:false,
          authorId:user._id,
          authorTopimg:user.topimg,
          authorAvatar:user.avatar
        });
      }
      else{
        return res.redirect('back');
        // '该用户不存在'
      }
      
    })
    .catch(next);
});

// GET /personal/users 所有博主的资料
router.get("/users",function(req,res,next){
  utils.toggleNav(req,res);//改变导航栏状态
  UserModel.getUsers()
    .then(function(users){
      res.render('users',{
        users: users,
        showDefaultLogo:true
      });
    })
    .catch(next);
  
});

// GET /personal 个人资料页的显示及更新
router.get('/',checkLogin, function(req, res, next) {
  var underlineCount = utils.toggleNav(req,res);//改变导航栏状态
  var author = req.session.user;

  UserModel.getUserById(author._id)
    .then(function (user) {
      if(user){
        delete user.password;
        req.session.user = user;
        res.render('personal',{
          date:utils.formatDate(new Date()),
          nicknameSelected : !underlineCount?true:false,
          authorName: req.session.user.nickname,
          user:user
        });
      }
      
    })
    .catch(next);
  
});

// POST /personal 用户更新资料
router.post('/avatar',checkLogin,function(req,res,next){
  var userId = req.fields.userid;
  var avatar = req.files.avatar.path.split(path.sep).pop();
  var avatarpath = req.files.avatar.path;
  var user = {
    
  };
  var pathPrefix = avatarpath.slice(0,avatarpath.lastIndexOf(path.sep));
  try {
    user.avatar = avatar;
  }catch (e) {
    // 失败，异步删除上传的头像
    fs.unlink(req.files.avatar.path);
    req.flash('error', e.message);
    return res.redirect('/personal');
  }
  Promise.all([UserModel.getUserById(userId),
    UserModel.updateUserById(userId, user),
    SessionModel.getSessions()])
    .then(function(result){
      try{
        if(!(result[0].avatar === 'avatar_default.jpg')){
          fs.unlink(`${pathPrefix}/${result[0].avatar}`);
        }
        
      }
      catch (e) {
        
        //捕获处理头像文件已经不存在的问题，继续执行代码
      }
      //更新session里的的头像信息
      req.session.user.avatar = avatar;
      utils.updateSession(result[2],userId,SessionModel,req);//更新和该用户相关的所有session
      res.end(JSON.stringify({msg:'ok'}));
    })
    .catch(next);
  
});
  
// POST /personal 用户更新资料
router.post('/', checkLogin, function(req, res, next) {
  var userId = req.fields.userid;
  var nickname = req.fields.nickname;
  var topimg = req.fields.topimg;
  var info = req.fields.info;
  
  var email = req.fields.email;

  // 校验参数
  try {
    if (!(nickname.length >= 1 && nickname.length <= 10)) {
      throw new Error('昵称请限制在 1-9 个字符');
    }
    if (nickname.trim().length == 0 ) {
      throw new Error('昵称不能为纯空白字符');
    }

  } catch (e) {
    // 失败  
    req.flash('error', e.message);
    return res.redirect('/personal');
  }

  // 待写入数据库的用户信息
  var user = {
    nickname: nickname,
    topimg: topimg,
    info: info,
    email: email
  };
  
  // 用户信息写入数据库
  Promise.all([UserModel.updateUserById(userId, user),
    SessionModel.getSessions()])
    .then(function (result) {
      
      req.session.user.nickname = nickname;
      req.session.user.topimg = topimg;
      req.session.user.info = info;
      req.session.user.email = email;
      req.session.user.password = null;
      utils.updateSession(result[1],userId,SessionModel,req);//更新和该用户相关的所有session
      req.flash('success', '个人资料编辑成功');
      // 编辑成功后跳转到上一页
      return res.redirect('/personal/info');
    })
    .catch(next);
});

module.exports = router;