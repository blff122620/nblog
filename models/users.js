var User = require('../lib/mongo').User;

module.exports = {
  // 注册一个用户
  create: function create(user) {
    return User.create(user).exec();
  },
  // 通过用户名获取用户信息
  getUserByName: function getUserByName(name) {
    return User
      .findOne({ name: name })
      .addCreatedAt()
      .exec();
  },
  // 通过用户名获取用户信息
  getUserById: function (id) {
    return User
      .findOne({ _id: id })
      .addCreatedAt()
      .exec();
  },
    // 通过用户 id 更新
  updateUserById: function updateUserById(userId, data) {
    return User.update({ _id: userId }, { $set: data }).exec();
  },
};