var marked = require('marked');
var xss = require('xss');
var Post = require('../lib/mongo').Post;
var CommentModel = require('./comments');
var pager = require('../lib/page');
var postContentLengh = 8;//保留的每篇文章的前多少行，列表页的显示
marked.setOptions({//markdown配置属性，自定义渲染函数
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
      post.content = xssFormat(post.content);
      return post;
    });
  },
  afterFindOne: function (post) {
    if (post) {

      post.content = marked(post.content);
      post.content = xssFormat(post.content);//防止xss攻击，过滤textarea内容，同时忽略过滤pre里的代码
      
    }
    return post;
  }
});

//防止xss攻击，过滤textarea内容，同时忽略过滤pre里的代码
function xssFormat(content){
  // var inCode = false ; //在pre代码块中
  return xss(content, {
    onIgnoreTagAttr: function (tag, name, value, isWhiteAttr) {
      if (name.substr(0, 5) === 'data-') {
        // 通过内置的escapeAttrValue函数来对属性值进行转义,不让懒加载失效,懒加载用到了data-数据
        return name + '="' + xss.escapeAttrValue(value) + '"';
      }
    },
    onTag:function(tag, html, options) {

      if (tag.substr(0,4) === 'code') {
        // 不对其属性列表进行过滤，让code部分代码可以高亮
        // inCode = !inCode; //在pre中的开关
        
        return html;
      }
      if(tag.substr(0,3) === 'div'){
          //处理div不被转义的问题
          return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
    }
  });
}

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
  //处理代码块，防止未写代码语言的代码块影响网页的布局，所以需要赋值默认的代码语言
  renderer.code = function(content,lang){
    if(!lang){
      return `<pre><code class="lang-markup">${content}</code></pre>`;
    }
    else{
      return `<pre><code class="lang-${lang}">${content}</code></pre>`;
    }
  };
  renderer.html = function(text){
    
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

// 给 post 分页用
/**
 * now 当前第几页
 */
Post.plugin('slice', {
  afterFind: function (posts,now,pager) {
    let pages = pager.getPages(posts.length);//总页数
        
    if(now <= 0){
      now = 1;
    }
    if(now > pages){
      now = pages;
    }
  
    return posts.slice((now-1)*pager.config.size,now*pager.config.size);
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
  getPosts: function (author) {
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

  // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章,不过这个获得是缩略，截取每个post的前postContentLengh行
  getPostsSkeleton: function (author,now) {
    var query = {};
    if (author) {
      query.author = author;
    }
    return Post
      .find(query)
      .slice(now,pager)
      .populate({ path: 'author', model: 'User' })
      .sort({ _id: -1 })
      .addCreatedAt()
      .addCommentsCount()
      .postsSkeleton()
      .contentToHtml()
      .exec();
  },
  
  // 获取文章总数
  getPostsCount: function (author) {
    var query = {};
    if (author) {
      query.author = author;
    }
    return Post
      .count(query)
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
