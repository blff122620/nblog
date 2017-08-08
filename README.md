# 响应式个人博客(兼多人博客)系统

> Nodejs环境下 利用express + ejs + mongodb 搭建的博客系统 :virgo:

其实这不是一个传统意义上的个人博客, 【**可以开放注册，让其他人也可以在此平台发博**】

## 主要功能点

- [x] 主页

  1. 支持分页
  
  2. 缩略显示文章
  
  3. 响应式
  
  4. 懒加载
  
  5. 头部载入进度条
  
- [x] 归档

  * 文章列表
      
- [x] 注册用户的主页
- [x] 注册用户的归档
- [x] 注册

  * 验证码操作
  
- [x] 登陆
- [x] 文章相关

  1. 支持markdown语法
      
  2. 支持插图
  
  3. 支持插入mp3音频
  
  4. 防止xss攻击过滤非法标签与属性
      
- [x] 评论
- [x] 个人资料编辑

  1. 头像裁剪上传
      
  2. 分支持手机端和pc端
      
- [x] 博主列表页+真正的博主简介页

  1. 所有注册的博主显示页
  
  2. 博主个人简介描述页

## 安装步骤

1. 安装依赖

注册验证码的依赖库，要首先安装
First download and install GraphicsMagick or ImageMagick. In Mac OS X, you can simply use Homebrew and do:

```
/* on mac */
brew install graphicsmagick
brew install imagemagick

/* on linux */
apt-get install graphicsmagick
```

2. 根目录运行 npm install

3. 本地安装mongodb

4. node index.js 运行项目

## 项目预览(PC端)

![项目截图](https://github.com/blff122620/blog/blob/master/static/img/blogpc.jpg?raw=true)

## 项目预览 (手机端)

![项目截图](https://github.com/blff122620/blog/blob/master/static/img/blogm.png?raw=true)
