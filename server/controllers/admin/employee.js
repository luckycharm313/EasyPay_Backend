var moment = require('moment')
var common = require('../../../config/common')
var jwt = require("jsonwebtoken")
var passwordHash = require('password-hash')
var Promise = require('promise')
var DB = require('../../../config/database')
var constants = require('../../../config/constants')
var employeeModel = require('../../models/employeeModel')
var companyModel = require('../../models/companyModel')

async function add (req, res, next) {
  const { employee_id, password, company_id } = req.body;
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    const _employee = await employeeModel.findUserByEmployeeId(employee_id, company_id);
    if(!_employee) return common.send(res, 300, '', "User doesn't exist. Please go to SignUp.");

    if ( passwordHash.verify(password, _employee.password) ) {

      let token = jwt.sign({ id: _employee.id, company_id: _employee.company_id }, constants.SECURITY_ADMIN_KEY, { expiresIn: 60 * 60 * 24 * 365 })

      let _query = 'UPDATE employee SET token = ?, updated_at = ? WHERE id = ? ';
      let _values = [ token, updated_at, _employee.id ];
      
      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        })
      })

      if (!_result) return common.send(res, 300, '', 'Database error');

      const employeeInfo = await employeeModel.findUserById(_employee.id);
      if (!employeeInfo) return common.send(res, 300, '', 'Database error');

      return common.send(res, 200, employeeInfo, 'Success');

    } else {
      return common.send(res, 300, '', 'Invalid Password');
    }    
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function loadCompany (req, res, next) {
  try {
    const companyInfo = await companyModel.getCompanyList();
    return common.send(res, 200, companyInfo, 'Success');
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function register (req, res, next) {
  const { company_id, employee_id, employee_name, password } = req.body;

  var _password = passwordHash.generate(password);
  var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    const _employee_ = await employeeModel.findUserByEmployeeId(employee_id, company_id);
    if (_employee_) return common.send(res, 300, '', 'Already registered.');

    var query = 'INSERT INTO employee (employee_id, employee_name, password, company_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)';
    var values = [ employee_id, employee_name, _password, company_id, created_at, updated_at];
    
    var result = await new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })

    if (!result) return common.send(res, 300, '', 'Database error');
    return common.send(res, 200, true, 'Success');
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function loadProductByCompany (req, res, next) {  
  var company_id = res.locals.company_id;
  try {
    const _products = await companyModel.getProductsByCompanyId(company_id);  
    return common.send(res, 200, _products, 'Success');
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function addNewItem (req, res, next) {  
  var company_id = res.locals.company_id;
  const { item, price } = req.body;
  
  var created_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    let _query =
      "INSERT INTO products ( company_id, item, price, created_at, updated_at) VALUES (?, ?, ?, ?, ?)";
    let _value = [company_id, item, price, created_at, updated_at];

    var _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _value, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });

    if (!_result) return common.send(res, 300, "", "Database Error");
    
    const _products = await companyModel.getProductsByCompanyId(company_id);  
    return common.send(res, 200, _products, 'Success');
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function updateToken (req, res, next) {  
  var id = res.locals.id;
  const { token } = req.body;
  
  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    let _query = 'UPDATE employee SET push_token = ?, updated_at = ? WHERE id = ? ';
    let _values = [ token, updated_at, id ];
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })
    if(!_result) return common.send(res, 300, '', 'Database Error');

    return common.send(res, 200, true, 'Success');
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

module.exports = {
  add,
  loadCompany,
  register,
  loadProductByCompany,
  addNewItem,
  updateToken
}