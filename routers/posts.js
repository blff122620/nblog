var express = require('express');
var router = express.Router();
var utils = require('../lib/utils');
var PostModel = require('../models/posts');
var UserModel = require('../models/users');
var checkLogin = require('../middlewares/check').checkLogin;
var CommentModel = require('../models/comments');
var pager = require('../lib/page');
var config = require('config-lite')(__dirname);

// GET /posts 所有用户或者特定用户的文章页
//   eg: GET /posts?author=xxx
router.get('/', function(req, res, next) {
  utils.toggleNav(req,res);//改变导航栏状态
  var author = req.query.author,
      archive = req.query.archive,
      page = req.query.page?req.query.page:1,//当前页码
      baseUri = req.baseUrl,
      nickname ='',
      authorTopimg = '',
      authorAvatar = '',
      symbol = author||archive?'&':'?',
      renderPage = 'index';

  if(archive){
    renderPage = 'archive';
  }
  if(author || archive){
    if(!archive){
      baseUri = [baseUri,'?author=',author].join('');
    }
    else if(!author){
      baseUri = [baseUri,'?archive=1'].join('');
      author = config.landlord;//默认只显示博主的文章
    }
    else{
      baseUri = [baseUri,'?archive=1&author=',author].join('');
    }
  }
  else{
    //默认只显示博主的文章
    author = config.landlord;
  }
  if(Array.isArray(page)){//如果有多个query,需要处理一下
    page = page[page.length-1];
  }
  else{
    page = parseInt(page);
    if(isNaN(page)){
      page = 1;
    }
  }
  Promise.all([UserModel.getUserById(author),
    PostModel.getPostsSkeleton(author,page),
    PostModel.getPostsCount(author)])
    .then(function(result){
      if(result[0]){
        nickname = result[0].nickname;
        authorTopimg = result[0].topimg;
        authorAvatar = result[0].avatar;
      }
      else if(author){//根本就没有这个用户，用户还伪造一个author参数，直接返回主页   
        try{
          throw new Error('该用户不存在，你要查一个不存在的人的文章吗？？');
        }
        catch(e){
          req.flash('error', e.message);
          return res.redirect('back');
        }
      }
      var postsTotal = result[2]; //文章总数
      var pagesTotal = pager.getPages(postsTotal); //总页数
      var barArr = pager.getPageArr(parseInt(page),pagesTotal,pager.config.min);//分页数组

      var posts = result[1];
      posts = posts.map(post=>{
        if(post.audio){
          post.audios = [post.audio,post.audio.toLowerCase().replace('.mp3','.webm')];
        }
        else{
          post.audios = '';
        }
        return post;
      });
      res.render(renderPage, {
        posts: result[1],
        date:utils.formatDate(new Date()),
        authorName:nickname,
        authorId:author,
        authorTopimg:authorTopimg,
        authorAvatar:authorAvatar,
        postsTotal:postsTotal,
        pageBar: pager.getPagebar(barArr,baseUri,page,symbol) //分页信息
      });
    })
    .catch(next);

});

// GET /archive 查看归档的博文（只显示标题，方便查找和存档记录）
router.get('/archive', function(req, res, next) {
  utils.toggleNav(req,res);//改变导航栏状态
  res.render('archive', {
      
  });
});

// POST /posts 发表一篇文章
router.post('/publisher', checkLogin, function(req, res, next) {
  var author = req.session.user._id,
      title = req.fields.title,
      tab = req.fields.tab,
      media = req.fields.img,
      img = '',
      audio = '',
      date = utils.formatDate(new Date()),
      content = req.fields.content;

  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题');
    }
    if (!content.length) {
      throw new Error('请填写文章内容');
    }
    if (!tab.length) {
      throw new Error('请填写标签');
    }
    if (!(title.trim().length && content.trim().length && tab.trim().length)) {
      throw new Error('标题、标签、文章内容不能为纯空白符');
    }
    ({img,audio} = handleMedia(media));
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  var post = {
    author: author,
    title: title,
    img:img,
    audio:audio,
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
      return res.redirect(`/posts/${post._id}`);
    })
    .catch(next);
});

// GET /posts/publisher 发表文章页
router.get('/publisher', checkLogin, function(req, res, next) {
  utils.toggleNav(req,res);//改变导航栏状态
  var date = new Date();
  var authorName = req.session.user.nickname;

  res.render("publisher.ejs",{
    date: utils.formatDate(date),
    authorName:authorName
  });
});

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function(req, res, next) {
  var postId = req.params.postId;
  var authorAvatar = '';
  Promise.all([
    PostModel.getPostById(postId),// 获取文章信息

    PostModel.incPv(postId)// pv 加 1
  ])
  .then(function (result) {
    var post = result[0];
    if (!post) {
      return res.redirect('/');
    }
    if(post.audio){
      post.audios = [post.audio,post.audio.toLowerCase().replace('.mp3','.webm')];
    }
    else{
      post.audios = '';
    }
    res.render('article', {
      post: post,
      authorName:post.author.nickname,
      authorId:post.author._id,
      authorTopimg:post.author.topimg,
      authorAvatar:post.author.avatar
    });
  })
  .catch(next);
});

// GET /posts/:postId/editor 更新文章页
router.get('/:postId/editor', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id,
      media = '';

  PostModel.getRawPostById(postId)
    .then(function (post) {
      try{
        if (!post) {
          throw new Error('该文章不存在');
        }
        if (author.toString() !== post.author._id.toString()) {
          throw new Error('权限不足');
        }
        let [img,audio] = [post.img,post.audio];
        if(img&&audio){
          media = [img,audio].join(',');
        }
        else{
          media = img?img:audio;
        }
        post.media = media;
      }
      catch(e){
        req.flash('error', e.message);
        return res.redirect('back');
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
  var postId = req.params.postId,
      author = req.session.user._id,
      title = req.fields.title,
      media = req.fields.img,
      img = '',
      tab = req.fields.tab,
      content = req.fields.content,
      audio = '';
  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题');
    }
    if (!content.length) {
      throw new Error('请填写文章内容');
    }
    if (!tab.length) {
      throw new Error('请填写标签');
    }
    if (!(title.trim().length && content.trim().length && tab.trim().length)) {
      throw new Error('更新失败，标题、标签、文章内容不能为纯空白符');
    }
    ({img,audio} = handleMedia(media));
  } catch (e) {
    req.flash('error', e.message);
    return res.redirect('back');
  }

  PostModel.updatePostById(postId, author, {
    title: title,
    content: content,
    tab:tab,
    img: img,
    audio: audio,
    date: utils.formatDate(new Date()) })
    .then(function () {
      req.flash('success', '文章编辑成功');
      // 编辑成功后跳转到上一页
      return res.redirect(`/posts/${postId}`);
    })
    .catch(next);
});

// GET /posts/:postId/removal 删除一篇文章
router.get('/:postId/removal', checkLogin, function(req, res, next) {
  var postId = req.params.postId;
  var author = req.session.user._id;

  PostModel.delPostById(postId, author)
    .then(function () {
      req.flash('success', '文章删除成功');
      // 删除成功后跳转到我的文章主页
      return res.redirect(`/posts?author=${author}`);
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
        
        message.status = 'valid';
        message.result = '留言成功';
        // 留言成功后返回
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

function handleMedia(media){
  var audio = '',
      img = '';
  if(media.toLowerCase().indexOf('.mp3')!='-1'){
    //利用页面头图的input来处理添加MP3的逻辑
    var items = media.split(',');
    if(items.length<=2){
      //只处理小于两项的media
      items.forEach(function(item){
        if(item.toLowerCase().indexOf('.mp3')!='-1'){
          audio = item.trim();
        }
        else{
          img = item.trim();
        }
      });
    }
  }
  else{
    //不包含MP3
    img = media.trim();
  }
  return {
    img: img,
    audio: audio
  }
}

module.exports = router;
