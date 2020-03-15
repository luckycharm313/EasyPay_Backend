var express = require('express');
var router = express.Router();
var middleware = require('./middleware');

var users = require('../controllers/admin/users');

router.post('/user/signup', users.zzz);

module.exports = router;