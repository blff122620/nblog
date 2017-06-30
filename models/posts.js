var marked = require('marked');
var Post = require('../lib/mongo').Post;
var CommentModel = require('./comments');
var postContentLengh = 10;//保留的每篇文章的前多少行，列表页的显示
marked.setOptions({
  renderer:getMarkedRenderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});
// 将 post 的 content 从 markdown 转换成 html
Post.plugin('contentToHtml', {
  afterFind: function (posts) {
    return posts.map(function (post) {
      post.content = marked(post.content);
      return post;
    });
  },
  afterFindOne: function (post) {
    if (post) {
      post.content = marked(post.content);
    }
    return post;
  }
});

// 将 post 的 content 截断，只留前几行
Post.plugin('postsSkeleton', {
  afterFind: function (posts) {
    return posts.map(function (post) {
      post.content = cutPost(post.content,"\r\n",postContentLengh);
      return post;
    });
  },
  afterFindOne: function (post) {
    if (post) {
      post.content = cutPost(post.content,"\r\n",postContentLengh);
    }
    return post;
  }
});

/**
 * 切割post.content ,只取前几行
 * 这里还要处理markdown的问题，不能截断 语句块``` ```
 * @param {*} content 
 * @param {*} pattern 
 * @param {*} lines 
 */
function cutPost(content,pattern,lines){
  var contentArray = content.split(pattern);
  var inBlock = false;
  var lineCount = 0;
  var appendStr = "\r\n# .................";
  var pairs = 0; //代码块是否成对的结束了,pairs 为偶数，则全部结束了
  return contentArray.filter(function(item,index){
    lineCount++;
    if(index<lines){
      if(item.indexOf("```") !=-1){
        inBlock = true;
        pairs++;
      }
      return true;
    }
    else if(inBlock){
      if(item.indexOf("```") !=-1){
        pairs++;
        if(pairs%2 == 0){
          inBlock = false;//代码块配对结束才退出循环
        }
        
      }
      return true;
    }
  }).join(pattern) + (lineCount>lines?appendStr:'');
}

function getMarkedRenderer(){
  var renderer = new marked.Renderer();
  renderer.image = function(href,title,text){
    return `<img src="/img/img_default.png" data-url="${href}" alt="${text}">`;
  };
  renderer.html = function(text){
    // console.log(text);
  };

  return renderer;
}

// 给 post 添加留言数 commentsCount
Post.plugin('addCommentsCount', {
  afterFind: function (posts) {
    return Promise.all(posts.map(function (post) {
      return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
        post.commentsCount = commentsCount;
        return post;
      });
    }));
  },
  afterFindOne: function (post) {
    if (post) {
      return CommentModel.getCommentsCount(post._id).then(function (count) {
        post.commentsCount = count;
        return post;
      });
    }
    return post;
  }
});

module.exports = {
  // 创建一篇文章
  create: function create(post) {
    return Post.create(post).exec();
  },

  // 通过文章 id 获取一篇文章
  getPostById: function getPostById(postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

  // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
  getPosts: function getPosts(author) {
    var query = {};
    if (author) {
      query.author = author;
    }
    return Post
      .find(query)
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addCommentsCount()
      .contentToHtml()
      .exec();
  },

    // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章,不过这个获得是缩略，截取每个post的前8行
  getPostsSkeleton: function getPosts(author) {
    var query = {};
    if (author) {
      query.author = author;
    }
    return Post
      .find(query)
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addCommentsCount()
      .postsSkeleton()
      .contentToHtml()
      .exec();
  },

  // 通过文章 id 给 pv 加 1
  incPv: function incPv(postId) {
    return Post
      .update({ _id: postId }, { $inc: { pv: 1 } })
      .exec();
  },
  // 通过文章 id 获取一篇原生文章（编辑文章）
  getRawPostById: function getRawPostById(postId) {
    return Post
      .findOne({ _id: postId })
      .populate({ path: 'author', model: 'User' })
      .exec();
  },

  // 通过用户 id 和文章 id 更新一篇文章
  updatePostById: function updatePostById(postId, author, data) {
    return Post.update({ author: author, _id: postId }, { $set: data }).exec();
  },

  // 通过用户 id 和文章 id 删除一篇文章
  delPostById: function delPostById(postId, author) {
    return Post.remove({ author: author, _id: postId })
      .exec()
      .then(function (res) {
        // 文章删除后，再删除该文章下的所有留言
        if (res.result.ok && res.result.n > 0) {
          return CommentModel.delCommentsByPostId(postId);
        }
      });
  }

};