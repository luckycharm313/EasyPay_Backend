var moment = require('moment');
var common = require('../../config/common');
var Promise = require('promise');
var DB = require('../../config/database');
var constants = require('../../config/constants');
var userModel = require('../models/userModel');
var receiptModel = require('../models/receiptModel');
var subReceiptModel = require('../models/subReceiptModel');
var employeeModel = require('../models/employeeModel');
var orderModel = require('../models/orderModel');
var messageModel = require('../models/messageModel');

async function getNotification (req, res, next) {
  var user_id = res.locals.user_id;
  var params = req.body;
  const { limit, employee_id } = params;

  try {
    const _notifications = await messageModel.getNotifications(user_id, limit);
    return common.send(res, 200, _notifications, 'Success');

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function blockEmployee (req, res, next) {
  var user_id = res.locals.user_id;
  var params = req.body;
  const { limit, employee_id } = params;
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  try {
    const _employee = await employeeModel.findUserById(employee_id);
    if(!_employee) return common.send(res, 300, '', 'Employee not found');
    let users_block = _employee['users_block'];
    var arr_users_block = users_block ? users_block.toString().split(',') : [];
    
    let index = arr_users_block.indexOf(user_id.toString());
    
    if( index === -1){
      arr_users_block.push(user_id);      
    } else {
      arr_users_block.splice( index, 1 );
    }
    
    let _query = 'UPDATE employee SET users_block = ?,  updated_at = ? WHERE id = ? ';
    let _values = [ arr_users_block.join(), updated_at, employee_id ];
    
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })

    if (!_result) return common.send(res, 300, '', 'Database error');

    const _notifications = await messageModel.getNotifications(user_id, limit);
    return common.send(res, 200, _notifications, 'Success');

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

module.exports = {
  getNotification,
  blockEmployee
}