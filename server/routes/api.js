var express = require('express');
var router = express.Router();
var middleware = require('./middleware');

var user = require('../controllers/user');
var receipt = require('../controllers/receipt');
var message = require('../controllers/message');

router.post('/user/phone', user.phone);
router.post('/user/verify', user.verify);
router.post('/user/add', user.addUserInfo);
router.post('/user/addCard', user.addUserCardInfo);
router.post('/user/recoveryInformation', middleware.auth, user.recoveryInformation);
router.post('/user/update', middleware.auth, user.updateUserInfo);
router.post('/user/changePhone', user.changePhone);
router.get('/user/get', middleware.auth, user.getInfo);
router.post('/user/blockPush', middleware.auth, user.blockPush);
router.post('/user/setRate', middleware.auth, user.setRate);
router.post('/user/updateCard', middleware.auth, user.updateCard);
router.post('/user/updateToken', middleware.auth, user.updateToken);
router.post('/receipt/get', receipt.get);
router.post('/receipt/pay', middleware.auth, receipt.pay);
router.post('/receipt/load', middleware.auth, receipt.loadHistory);

router.post('/message/getNotification', middleware.auth, message.getNotification);
router.post('/message/blockEmployee', middleware.auth, message.blockEmployee);
router.post('/message/deleteAnnounce', middleware.auth, message.deleteAnnounce);
// one time payment
router.post('/user/addOneUser', user.addOneUser);
router.post('/receipt/payOne', receipt.payOne);
router.post('/user/getOne', user.getOne);

module.exports = router;