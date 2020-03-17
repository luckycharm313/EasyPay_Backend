var moment = require('moment')
var common = require('../../../config/common')
var Promise = require('promise')
var DB = require('../../../config/database')
var constants = require('../../../config/constants')
var employeeModel = require('../../models/employeeModel')
var orderModel = require('../../models/orderModel')
var receiptModel = require('../../models/receiptModel')
var subReceiptModel = require('../../models/subReceiptModel')

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

async function split (req, res, next) {
  var employee_id = res.locals.employee_id;

  var params = req.body;
  const { receipt_id, sub_receipt_numbers } = params;

  var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  
  try {
    
    let del_query = 'DELETE FROM sub_receipts WHERE parent_receipt_id = ? '
    let del_values = [receipt_id]

    let del_result = await new Promise(function (resolve, reject) {
      DB.query(del_query, del_values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })
    
    let _query = 'UPDATE receipts SET sub_receipt_numbers = ?, is_sub_receipt= ?, updated_at = ? WHERE id = ? ';
    let _values = [ sub_receipt_numbers, sub_receipt_numbers === 0 ? 0 : 1, updated_at, receipt_id ];
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })
    if(!_result) return common.send(res, 300, '', 'Database Error');

    const _receipt = await receiptModel.findReceiptById(receipt_id);
    if(!_receipt) return common.send(res, 300, '', 'Receipt not found');
    
    if( sub_receipt_numbers > 0 ) {
      var cost = parseFloat(_receipt.total) / sub_receipt_numbers;
      
      var add_values = [];
      let add_query = 'INSERT INTO sub_receipts ( parent_receipt_id, cost, created_at, updated_at) VALUES ?'
      for( var i = 0 ; i < sub_receipt_numbers ; i++ ) {
        add_values.push([
          receipt_id,
          cost,
          created_at,
          updated_at
        ])
      }
  
      var add_result = await new Promise(function (resolve, reject) {
        DB.query(add_query, [add_values], function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        })
      })

      if(!add_result) return common.send(res, 300, '', 'Database Error');
    }
    var sub_receipts = []
    if( sub_receipt_numbers > 0 ) {
      sub_receipts = await subReceiptModel.findBillByReceiptId(receipt_id);
      if(!sub_receipts) return common.send(res, 300, '', 'Split Bill not found');
    }    

    const _employee = await employeeModel.findUserById(employee_id);
    if(!_employee) return common.send(res, 300, '', 'Employee not found');

    const _orders = await orderModel.findOrdersByReceiptId(receipt_id);
    if(!_orders) return common.send(res, 300, '', 'Orders not found');
    
    let payload = {
      employee: _employee,
      sub_receipts,
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
  get,
  split
}