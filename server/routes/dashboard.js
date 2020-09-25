var express = require('express');
var router = express.Router();
var middleware = require('./middleware');

var company = require('../controllers/dashboard/company');
var admin = require('../controllers/dashboard/admin');
var transaction = require('../controllers/dashboard/transaction');
var user = require('../controllers/dashboard/user');

router.post('/register', admin.register);
router.post('/login', admin.login);
router.post('/forgot', admin.forgot);
router.post('/reset', admin.reset);
router.post('/postCompanyInfo', company.postCompanyInfo);
router.post('/company/getList', middleware.dashboard, company.getList);
router.post('/company/getProductsByCompany', middleware.dashboard, company.getProductsByCompany);
router.post('/company/updateProduct', middleware.dashboard, company.updateProduct);
router.post('/company/addProduct', middleware.dashboard, company.addProduct);
router.post('/company/deleteProduct', middleware.dashboard, company.deleteProduct);
router.post('/company/updateCompany', middleware.dashboard, company.updateCompany);
router.post('/company/deleteCompany', middleware.dashboard, company.deleteCompany);

router.get('/transaction/getList', middleware.dashboard, transaction.getList);
router.post('/transaction/detail', middleware.dashboard, transaction.detail);

router.post('/transaction/chartInfo', middleware.dashboard, transaction.chartInfo);

router.post('/user/getList', middleware.dashboard, user.getList);
router.post('/user/deleteUser', middleware.dashboard, user.deleteUser);
router.post('/user/blockUser', middleware.dashboard, user.blockUser);
router.get('/user/getAdminList', middleware.dashboard, user.getAdminList);
router.post('/user/deleteAdmin', middleware.dashboard, user.deleteAdmin);
router.get('/admin/getAdminProfile', middleware.dashboard, admin.getAdminProfile);
router.post('/admin/updateAdminProfile', middleware.dashboard, admin.updateAdminProfile);
router.get('/user/getRequest', middleware.dashboard, user.getCustomerRequest);
router.post('/user/replyRequest', middleware.dashboard, user.replyRequest);

module.exports = router;