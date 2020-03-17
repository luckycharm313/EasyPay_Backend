var express = require('express');
var router = express.Router();
var middleware = require('./middleware');

var employee = require('../controllers/admin/employee');
var receipt = require('../controllers/admin/receipt');

router.post('/employee/add', employee.add);
router.post('/receipt/orders', middleware.admin, receipt.orders);
router.post('/receipt/get', middleware.admin, receipt.get);
router.post('/receipt/split', middleware.admin, receipt.split);

module.exports = router;