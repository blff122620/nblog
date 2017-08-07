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
  var inCode = false ; //在pre代码块中
  return xss(content, {
    onIgnoreTagAttr: function (tag, name, value, isWhiteAttr) {
      if (name.substr(0, 5) === 'data-' || name === 'style' || name === 'class') {
        // 不过滤style样式属性,class属性
        // 通过内置的escapeAttrValue函数来对属性值进行转义,不让懒加载失效,懒加载用到了data-数据
        return name + '="' + xss.escapeAttrValue(value) + '"';
      }
    },
    onTag:function(tag, html, options) {
      if (tag.substr(0,4) === 'code') {
        // 不对其属性列表进行过滤，让code部分代码可以高亮
        inCode = !inCode; //在pre中的开关
        
        return html;
      }
      if(inCode){
        //在代码块中，处理div不被转义的问题
        if(tag.substr(0,3) === 'div'){
          //处理div不被转义的问题
          return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
      }
      else{
        //不在代码块中
        // 不对其属性列表进行过滤，让style样式标签生效
        if (tag.substr(0,5) === 'style' ) {
          return html;
        }
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
  var contentArray = content.split(pattern),
    inBlock = false,
    tagTestFlag = true,
    endtagFlag = 1,//结束标签，只运行一次，也就是返回结束标签那一句话
    lineCount = 0,
    appendStr = "\r\n# .................",
    pairs = 0, //代码块是否成对的结束了,pairs 为偶数，则全部结束了
    tempContent = ''; //临时结果，判断临时结果标签是否配对结束
  return contentArray.filter(function(item,index){
    tempContent += item;//临时文章内容结果增加
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
          inBlock = false;//代码块配对结束
        }

      }
      return true;
    }
    
    //首先判断截取部分是否有未结束的标签，有则需要继续增大截取部分
    
    if(tagTestFlag && index>=lines && !tagCoupleOver(tempContent)){
      return true;
    }
    if(index>=lines && tagCoupleOver(tempContent)){
      tagTestFlag = false;//一旦标签匹配结束（tagTestFlag的作用），那么不再执行tag判断,并且标签结束这一行也要返回
      return endtagFlag++ == 1 ? true : false;
    }
    
    
  }).join(pattern) + (lineCount>lines?appendStr:'');
}
/**
 * 判断内容中<tag></tag>标签是否成对结束
 */
function tagCoupleOver(content){
  var stack = [], //标签栈
    index , //游标，记录查询到哪个位置
    matchResult,
    tagPattern = /<\/?([a-zA-Z]+?)(?:(\s+?[^>]*)?\s*?)>/g; //匹配<div></div>两种标签
  matchResult = content.match(tagPattern);
  if(!matchResult){
    matchResult = [];
  }
  matchResult = matchResult.map((tag)=>{
    //重构标签数组，只留下标签名 <div xxxx> => div,</div xxxx> => div
    return tag.replace(tagPattern,'$1');
  });

  matchResult.forEach((tag)=> {
    if(stack[stack.length-1] === tag){
      stack.pop();//标签匹配，出栈
    }
    else{
      stack.push(tag);//标签不匹配，入栈
    }
  });
  
  //栈空，返回true,标签配对合法
  return stack.length === 0 ? true:  false;
  
}

function getMarkedRenderer(){
  var renderer = new marked.Renderer(),
      cssClass = 'opa0 trans3';
  renderer.image = function(href,title,text){
    return `<img src="/img/img_default.png" data-url="${href}" alt="${text}">`;
  };
  //处理代码块，防止未写代码语言的代码块影响网页的布局，所以需要赋值默认的代码语言
  renderer.code = function(content,lang){
    if(!lang){
      return `<pre class="${cssClass}"><code class="lang-markup">${content}</code></pre>`;
    }
    else{
      return `<pre class="${cssClass}"><code class="lang-${lang}">${content}</code></pre>`;
    }
    
  };
  // renderer.html = function(text){
    
  // };

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
