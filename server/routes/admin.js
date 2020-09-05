var express = require('express');
var router = express.Router();
var middleware = require('./middleware');

var employee = require('../controllers/admin/employee');
var receipt = require('../controllers/admin/receipt');
var message = require('../controllers/admin/message');

router.post('/employee/add', employee.add);
router.get('/employee/loadCompany', employee.loadCompany);
router.post('/employee/register', employee.register);
router.get('/employee/loadProductByCompany', middleware.admin, employee.loadProductByCompany);
router.post('/receipt/orders', middleware.admin, receipt.orders);
router.post('/receipt/get', middleware.admin, receipt.get);
router.post('/receipt/split', middleware.admin, receipt.split);
router.post('/receipt/load', middleware.admin, receipt.loadHistory);
router.post('/receipt/search', middleware.admin, receipt.search);
router.post('/receipt/refund', middleware.admin, receipt.refund);
router.post('/receipt/cancel', middleware.admin, receipt.cancelTransaction);
router.post('/receipt/accept', middleware.admin, receipt.accept);
router.post('/receipt/nfc', middleware.admin, receipt.nfc);

router.post('/message/sendAnnouncement', middleware.admin, message.sendAnnouncement);
router.post('/message/getAnnounceHistory', middleware.admin, message.getAnnounceHistory);
router.post('/message/deleteAnnounce', middleware.admin, message.deleteAnnounce);
module.exports = router;