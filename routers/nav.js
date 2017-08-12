const express = require('express');

const router = express.Router();

// GET /nav 导航列表的显示
router.get('/', (req, res, next) => {
  const navs = [];
  const temp = {
    href: '',
  };
  return res.redirect('/posts');
});

module.exports = router;
