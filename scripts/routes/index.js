var express = require('express');
var router = express.Router();
var middleware = require('./middleware');

var customer = require('../controllers/customer');
router.post('/customer/request', customer.sendRequest);

module.exports = router;