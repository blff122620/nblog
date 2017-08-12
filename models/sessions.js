const Session = require('../lib/mongo').Session;

module.exports = {

  getSessions() {
    const query = {};
    return Session
      .find(query)
      .exec();
  },
  // 通过用户 sessionid 更新session
  updateSessionById(sessionId, data) {
    return Session.update({ _id: sessionId }, { $set: data }).exec();
  },
};
