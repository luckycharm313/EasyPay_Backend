var express = require('express');
var router = express.Router();
var middleware = require('./middleware');

var users = require('../controllers/users');

router.post('/user/signup', users.signup);
router.post('/user/signin', users.signin);
router.post('/user/loadUserProfile', middleware.auth, users.loadUserProfile);
router.post('/user/updateUserProfile', middleware.auth, users.updateUserProfile);

module.exports = router;