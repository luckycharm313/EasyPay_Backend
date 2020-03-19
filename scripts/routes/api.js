var express = require('express');
var router = express.Router();
var middleware = require('./middleware');

var user = require('../controllers/user');
router.post('/user/phone', user.phone);
router.post('/user/verify', user.verify);
router.post('/user/add', user.addUserInfo);

module.exports = router;