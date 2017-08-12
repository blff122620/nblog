const User = require('../lib/mongo').User;

const PostModel = require('./posts');

module.exports = {
  // 注册一个用户
  create(user) {
    return User.create(user).exec();
  },
  // 通过用户名获取用户信息
  getUserByName(name) {
    return User
      .findOne({ name })
      .addCreatedAt()
      .exec();
  },
  // 通过用户名获取用户信息
  getUserById(id) {
    return User
      .findOne({ _id: id })
      .addCreatedAt()
      .exec();
  },
  // 获取所有用户
  getUsers() {
    return User
      .find({ })
      .addPostsCount()
      .addCreatedAt()
      .exec();
  },
  // 通过用户 id 更新
  updateUserById(userId, data) {
    return User.update({ _id: userId }, { $set: data }).exec();
  },
};

// 给 User 添加发表的文章总数
User.plugin('addPostsCount', {
  afterFind(users) {
    return Promise.all(users.map((user) => {
      return PostModel.getPostsCount(user._id)
        .then((postsCount) => {
          user.postsCount = postsCount;
          return user;
        });
    }));
  },
});
