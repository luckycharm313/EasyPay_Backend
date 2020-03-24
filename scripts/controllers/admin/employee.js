var moment = require('moment')
var common = require('../../../config/common')
var jwt = require("jsonwebtoken")
var passwordHash = require('password-hash')
var Promise = require('promise')
var DB = require('../../../config/database')
var constants = require('../../../config/constants')
var employeeModel = require('../../models/employeeModel')

async function add (req, res, next) {
  var params = req.body;
  const { biz_name, biz_phone, biz_address, manager_id, manager_pin, self_id, tax, password, company_id } = params;

  var _password = passwordHash.generate(password);
  var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    const _employee = await employeeModel.findUserBySelfId(self_id, company_id);

    if( _employee ) { // update

      let token = jwt.sign({ id: _employee.id, self_id: _employee.self_id }, constants.SECURITY_ADMIN_KEY, { expiresIn: 60 * 60 * 24 * 365 })

      let _query = 'UPDATE employee SET token = ?, updated_at = ?, biz_name = ?, biz_phone = ?, biz_address = ?, manager_id = ?, manager_pin = ?, tax = ?, password = ? WHERE id = ? ';
      let _values = [ token, updated_at, biz_name, biz_phone, biz_address, manager_id, manager_pin, tax, _password, _employee.id ];
      
      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        })
      })

      if (!_result) return common.send(res, 300, '', 'Database error');

    } else { // insert

      var query = 'INSERT INTO employee ( biz_name, biz_phone, biz_address, manager_id, manager_pin, self_id, tax, password, company_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      var values = [ biz_name, biz_phone, biz_address, manager_id, manager_pin, self_id, tax, _password, 1, created_at, updated_at];
      
      var result = await new Promise(function (resolve, reject) {
        DB.query(query, values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        })
      })

      if (!result) return common.send(res, 300, '', 'Database error');

      const _employee_ = await employeeModel.findUserBySelfId(self_id, company_id);

      let token = jwt.sign({ id: _employee_.id, self_id: _employee_.self_id }, constants.SECURITY_ADMIN_KEY, { expiresIn: 60 * 60 * 24 * 365 });
      
      let _query = 'UPDATE employee SET token = ?, updated_at = ? WHERE id = ? ';
      let _values = [ token, updated_at, _employee_.id ];
      
      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        })
      })

      if (!_result) return common.send(res, 300, '', 'Database error');
    }

    // final
    const employeeInfo = await employeeModel.findUserBySelfId(self_id, company_id);
    if (!employeeInfo) return common.send(res, 300, '', 'Database error');

    return common.send(res, 200, employeeInfo, 'Success');

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

module.exports = {
  add,
}