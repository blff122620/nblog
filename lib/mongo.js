const config = require('config-lite')(__dirname);

const moment = require('moment');

const objectIdToTimestamp = require('objectid-to-timestamp');

const Mongolass = require('mongolass');

const mongolass = new Mongolass();
mongolass.connect(config.mongodb);

exports.Session = mongolass.model('Session', {
  session: { type: 'string' },
  expires: { type: 'date' },
});

exports.Session.index({ _id: 1 }).exec();

exports.User = mongolass.model('User', {
  name: { type: 'string' },
  password: { type: 'string' },
  nickname: { type: 'string' },
  avatar: { type: 'string' },
  gender: { type: 'string', enum: ['m', 'f', 'x'] },
  bio: { type: 'string' },
  info: { type: 'string' },
  email: { type: 'string' },
  topimg: { type: 'string' },
});
exports.User.index({ name: 1 }, { unique: true }).exec();// 根据用户名找到用户，用户名全局唯一

// 根据 id 生成创建时间 created_at
mongolass.plugin('addCreatedAt', {
  afterFind(results) {
    results.forEach((item) => {
      item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
    });
    return results;
  },
  afterFindOne(result) {
    if (result) {
      result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
    }
    return result;
  },
});

exports.Post = mongolass.model('Post', {
  author: { type: Mongolass.Types.ObjectId },
  title: { type: 'string' },
  content: { type: 'string' },
  tab: { type: 'string' },
  date: { type: 'string' },
  img: { type: 'string' },
  audio: { type: 'string' },
  pv: { type: 'number' },
});
exports.Post.index({ author: 1, _id: -1 }).exec();// 按创建时间降序查看用户的文章列表

exports.Comment = mongolass.model('Comment', {
  author: { type: Mongolass.Types.ObjectId },
  content: { type: 'string' },
  postId: { type: Mongolass.Types.ObjectId },
  commentId: { type: Mongolass.Types.ObjectId },
});
exports.Comment.index({ postId: 1, _id: 1 }).exec();// 通过文章 id 获取该文章下所有留言，按留言创建时间升序
exports.Comment.index({ author: 1, _id: 1 }).exec();// 通过用户 id 和留言 id 删除一个留言
