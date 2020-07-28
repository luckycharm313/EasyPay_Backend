var express = require('express');
var router = express.Router();
var middleware = require('./middleware');

var employee = require('../controllers/admin/employee');
var receipt = require('../controllers/admin/receipt');

router.post('/employee/add', employee.add);
router.post('/receipt/orders', middleware.admin, receipt.orders);
router.post('/receipt/get', middleware.admin, receipt.get);
router.post('/receipt/split', middleware.admin, receipt.split);
router.post('/receipt/load', middleware.admin, receipt.loadHistory);
router.post('/receipt/search', middleware.admin, receipt.search);
router.post('/receipt/refund', middleware.admin, receipt.refund);
router.post('/receipt/cancel', middleware.admin, receipt.cancelTransaction);
router.post('/receipt/accept', middleware.admin, receipt.accept);
module.exports = router;