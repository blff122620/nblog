var express = require('express');
var router = express.Router();
var utils = require('../lib/utils');
var PostModel = require('../models/posts');
var UserModel = require('../models/users');
var checkLogin = require('../middlewares/check').checkLogin;
var CommentModel = require('../models/comments');

// GET /posts 所有用户或者特定用户的文章页
//   eg: GET /posts?author=xxx
router.get('/', function(req, res, next) {
  utils.toggleNav(req,res);//改变导航栏状态
  var author = req.query.author;
  var nickname ='';
  UserModel.getUserById(author)
    .then(function (user) {
      if(user){
        nickname = user.nickname;
      }
      
    });
  PostModel.getPosts(author)
    .then(function (posts) {
      
      res.render('index', {
        posts: posts,
        date:utils.formatDate(new Date()),
        authorName:nickname
      });
    })
    .catch(next);
});

// POST /posts 发表一篇文章
router.post('/publisher', checkLogin, function(req, res, next) {
  var author = req.session.user._id;
  var title = req.fields.title;
  var tab = req.fields.tab;
  var img = req.fields.img;
  var date = utils.formatDate(new Date());
  var content = req.fields.content;

  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题');
    }
    if (!content.length) {
      throw new Error('请填写内容');
    }
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  var post = {
    author: author,
    title: title,
    img:img,
    tab:tab,
    date:date,
    content: content,
    pv: 0
  };

  PostModel.create(post)
    .then(function (result) {
      // 此 post 是插入 mongodb 后的值，包含 _id
      post = result.ops[0];
      req.flash('success', '发表成功');
      // 发表成功后跳转到该文章页
      res.redirect(`/posts/${post._id}`);
    })
    .catch(next);
});

// GET /posts/publisher 发表文章页
router.get('/publisher', checkLogin, function(req, res, next) {
  utils.toggleNav(req,res);//改变导航栏状态
  var date = new Date();
  
  res.render("publisher.ejs",{
    date: utils.formatDate(date)
  });
});

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function(req, res, next) {
  var postId = req.params.postId;
  
  Promise.all([
    PostModel.getPostById(postId),// 获取文章信息
    
    PostModel.incPv(postId)// pv 加 1
  ])
  .then(function (result) {
    var post = result[0];
    if (!post) {
      // res.redirect('back');
      throw new Error('该文章不存在');    
    }

    res.render('article', {
      post: post,
      authorName:post.author.nickname
    });
  })
  .catch(next);
});

// GET /posts/:postId/editor 更新文章页
router.get('/:postId/editor', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id;

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('该文章不存在');
      }
      if (author.toString() !== post.author._id.toString()) {
        throw new Error('权限不足');
      }
      res.render('editor', {
        post: post,
        date: utils.formatDate(new Date)
      });
    })
    .catch(next);
});

// POST /posts/:postId/editor 更新一篇文章
router.post('/:postId/editor', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id;
  var title = req.fields.title;
  var img = req.fields.img;
  var tab = req.fields.tab;
  var content = req.fields.content;

  PostModel.updatePostById(postId, author, { 
    title: title, 
    content: content,
    tab:tab,
    img: img,
    date: utils.formatDate(new Date()) })
    .then(function () {
      req.flash('success', '文章编辑成功');
      // 编辑成功后跳转到上一页
      res.redirect(`/posts/${postId}`);
    })
    .catch(next);
});

// GET /posts/:postId/removal 删除一篇文章
router.get('/:postId/removal', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id;

  PostModel.delPostById(postId, author)
    .then(function () {
      // req.flash('success', '文章删除成功');
      // 删除成功后跳转到主页
      res.redirect(`/posts?author=${author}`);
    })
    .catch(next);
});

router.get('/:postId/comment/',function(req,res,next){
  var postId = req.params.postId;
  var author = req.session.user?req.session.user._id:'';
  var postAuthor = false;
  Promise.all([
    PostModel.getPostById(postId),
    CommentModel.getComments(postId)
    ])
    .then(function(result){
      if(result[0].author._id == author){
        postAuthor = true;
      }
      result[1].forEach(function(item){
        item["post_author"] = postAuthor;
        item["session_author"] = author;
      });
      res.end(JSON.stringify(result[1]));
    })
    .catch(next);// 获取该文章所有留言
});
// POST /posts/:postId/comment 创建一条留言
router.post('/:postId/comment', function(req, res, next) {
  
  var postId = req.fields.postId;
  var content = req.fields.comment;
  var author = '';
  var message = {
    status:'notvalid',
    result:''
  };
  var comment = {
    postId: postId,
    content: content
  };
  if(req.session.user){
    author = req.session.user._id;
    comment['author'] = author;
  }
  if(comment.content){
    CommentModel.create(comment)
      .then(function () {
        // req.flash('success', '留言成功');
        message.status = 'valid';
        message.result = '留言成功';
        // 留言成功后跳转到上一页
        // res.redirect('back');
        res.end(JSON.stringify(message));
      })
      .catch(next);
  }else{
    message.result = "朋友，您啥也没写啊";
    res.end(JSON.stringify(message));
  }
});

// GET /posts/:postId/comment/:commentId/remove 删除一条留言
router.get('/:postId/comment/:commentId/removal', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var commentId = req.params.commentId;
  var author = req.session.user._id;
  var canDelComment = false;
  Promise.all([
    CommentModel.getRawCommentById(commentId),
    PostModel.getPostById(postId)
  ])
    .then(function(result){
      if (author ==result[1].author._id){
        //这篇文章就是当前登陆用户的文章
        canDelComment = true;
      }
      else if(result[0].author && result[0].author == author){
        canDelComment = true;
      }
      
    })
    .then(function(){
      if(canDelComment){
        CommentModel.delCommentById(commentId)
      
        .then(function(){
          CommentModel.getComments(postId)
          .then(function(comment){
            res.end(JSON.stringify(comment));
          });
          
        });
      }
      else{
        res.end("");
      }
    })
    .catch(next);
  
  

    
});

module.exports = router;