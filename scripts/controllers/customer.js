var moment = require('moment');
var common = require('../../config/common');
var Promise = require('promise');
var DB = require('../../config/database');
var constants = require('../../config/constants');
var customerModel = require('../models/customerModel');

async function sendRequest (req, res, next) {
  var params = req.body;
  const { phone } = params;
  
  var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    const _customer = await customerModel.findCustomerByPhone(phone);
    if(!_customer) {      
      let _query = 'INSERT INTO customers ( phone, created_at, updated_at) VALUES (?, ?, ?)';
      let _values = [ phone, created_at, updated_at];
      
      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        })
      })

      if (!_result) return common.send(res, 300, '', 'Database error');
    } 
    return common.send(res, 200, true, 'Success');

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

module.exports = {
  sendRequest,
}