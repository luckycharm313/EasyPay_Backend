var express = require('express');
var router = express.Router();
var middleware = require('./middleware');

var user = require('../controllers/user');
var receipt = require('../controllers/receipt');

router.post('/user/phone', user.phone);
router.post('/user/verify', user.verify);
router.post('/user/add', user.addUserInfo);
router.get('/user/get', middleware.auth, user.getInfo);
router.post('/user/setRate', middleware.auth, user.setRate);
router.post('/receipt/get', receipt.get);
router.post('/receipt/pay', middleware.auth, receipt.pay);
router.post('/receipt/load', middleware.auth, receipt.loadHistory);

// one time payment
router.post('/user/addOneUser', user.addOneUser);
router.post('/receipt/payOne', receipt.payOne);
router.post('/user/getOne', user.getOne);

module.exports = router;