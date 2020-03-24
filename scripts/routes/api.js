var express = require('express');
var router = express.Router();
var middleware = require('./middleware');

var user = require('../controllers/user');
var receipt = require('../controllers/receipt');

router.post('/user/phone', user.phone);
router.post('/user/verify', user.verify);
router.post('/user/add', user.addUserInfo);
router.post('/receipt/get', middleware.auth, receipt.get);
router.post('/receipt/pay', middleware.auth, receipt.pay);

module.exports = router;