var express = require('express');
var router = express.Router();

// GET /nav 导航列表的显示
router.get('/', function(req, res, next) {
  var navs = [];
  var temp = {
      href:'',
      content
  };
  return res.redirect('/posts');
});

module.exports = router;