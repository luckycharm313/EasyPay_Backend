var moment = require('moment')
var common = require('../../../config/common')
var Promise = require('promise')
var DB = require('../../../config/database')
var constants = require('../../../config/constants')
var employeeModel = require('../../models/employeeModel')
var orderModel = require('../../models/orderModel')
var receiptModel = require('../../models/receiptModel')

async function orders (req, res, next) {
  var employee_id = res.locals.employee_id;

  var params = req.body;
  const { orders, sub_total, total, tax } = params;

  var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    const _employee = await employeeModel.findUserById(employee_id);
    if(!_employee) return common.send(res, 300, '', 'Employee not found');

    var query = 'INSERT INTO receipts ( employee_id, total, sub_total, tax, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)';
    var values = [ employee_id, total, sub_total, tax, created_at, updated_at];
    
    var receipt_id = await new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? data.insertId : false);
      })
    })

    if (!receipt_id) return common.send(res, 300, '', 'Database error');

    var _values = [];
    let _query = 'INSERT INTO orders ( receipt_id, name, quantity, price, created_at, updated_at) VALUES ?'
    orders.forEach(element => {
      _values.push([
        receipt_id,
        element.name,
        element.quantity,
        element.price,
        created_at,
        updated_at
      ])
    });

    var result = await new Promise(function (resolve, reject) {
      DB.query(_query, [_values], function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })
    
    return result ? common.send(res, 200, receipt_id, 'Success') : common.send(res, 300, false, 'Database error');

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function get (req, res, next) {
  var employee_id = res.locals.employee_id;

  var params = req.body;
  const { receipt_id } = params;
  
  try {
    const _employee = await employeeModel.findUserById(employee_id);
    if(!_employee) return common.send(res, 300, '', 'Employee not found');
    
    const _receipt = await receiptModel.findReceiptById(receipt_id);
    if(!_receipt) return common.send(res, 300, '', 'Receipt not found');

    const _orders = await orderModel.findOrdersByReceiptId(receipt_id);
    if(!_orders) return common.send(res, 300, '', 'Orders not found');
    
    let payload = {
      employee: _employee ,
      receipt: _receipt,
      orders: _orders,
    }
    
    return common.send(res, 200, payload, 'Success')

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

module.exports = {
  orders,
  get
}