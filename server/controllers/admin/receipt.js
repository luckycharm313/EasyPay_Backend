var moment = require('moment')
var common = require('../../../config/common')
var Promise = require('promise')
var DB = require('../../../config/database')
var constants = require('../../../config/constants')
var employeeModel = require('../../models/employeeModel')
var orderModel = require('../../models/orderModel')
var receiptModel = require('../../models/receiptModel')
var subReceiptModel = require('../../models/subReceiptModel')

const stripe = require('stripe')(constants.STRIPE_SECURITY_KEY);

async function orders (req, res, next) {
  var employee_id = res.locals.id;

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
    let _query = 'INSERT INTO orders ( receipt_id, quantity, product_id, created_at, updated_at) VALUES ?'
    orders.forEach(element => {
      _values.push([
        receipt_id,
        element.quantity,
        element.product_id,
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
  var employee_id = res.locals.id;

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
  var employee_id = res.locals.id;

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

async function loadHistory (req, res, next) {
  var employee_id = res.locals.id;
    
  var params = req.body;
  const { limit } = params;
  
  try {
    
    const _receipt = await receiptModel.getAdminHistoryByLimit( employee_id, limit );
    return common.send(res, 200, _receipt, 'Success');

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function search (req, res, next) {
  var employee_id = res.locals.id;
    
  var params = req.body;
  const { search, limit } = params;
  
  try {
    
    const _receipt = await receiptModel.getSearchByLimit( employee_id, search, limit );
    return common.send(res, 200, _receipt, 'Success');

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function refund (req, res, next) {
  var employee_id = res.locals.id;
    
  var params = req.body;
  const { receipt_id, refund_amount, pin } = params;
  var refund_at = Math.ceil( new Date().getTime() / 1000 );
  
  try {
    
    const _manager = await employeeModel.findManagerById( pin, employee_id );
    if(!_manager) return common.send(res, 300, '', 'Invalid PIN');

    var charge_id = ''
    if(receipt_id.toString().search('-') > -1) {
      var temp = receipt_id.toString().split('-');
      let  r_id = temp[1]

      let sub_receipts = await subReceiptModel.findBillByReceiptIdAndSubId(receipt_id, r_id);
      if(!sub_receipts) return common.send(res, 300, '', 'Receipt not found');

      charge_id = sub_receipts.transaction_id

    } else {
      const _receipt = await receiptModel.findReceiptById(receipt_id);
      if(!_receipt) return common.send(res, 300, '', 'Receipt not found');
      charge_id = _receipt.transaction_id
    }
    

    const _refund = await stripe.refunds.create({
      amount: Math.ceil(refund_amount * 100),
      charge: charge_id,
    });

    if(_refund) {
      if(receipt_id.toString().search('-') > -1) {
        let _temp = receipt_id.toString().split('-');
        let  _r_id = _temp[1]
        let _query = 'UPDATE sub_receipts SET refund_amount = ?, is_refund= ?, refund_at = ? WHERE id = ? AND parent_receipt_id = ?';
        let _values = [ refund_amount, 1, refund_at, _r_id, receipt_id ];
        let _result = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? true : false);
          })
        })
        if(!_result) return common.send(res, 300, '', 'Database Error');

      } else {
        let _query = 'UPDATE receipts SET refund_amount = ?, is_refund= ?, refund_at = ? WHERE id = ? ';
        let _values = [ refund_amount, 1, refund_at, receipt_id ];
        let _result = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? true : false);
          })
        })
        if(!_result) return common.send(res, 300, '', 'Database Error');

      }
      return common.send(res, 200, true, 'Success');
    }

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}



async function cancelTransaction (req, res, next) {
  var employee_id = res.locals.id;
    
  var params = req.body;
  const { isHasSub, id, limit } = params;
  try {
    let _query = '';
    if( isHasSub === 1 ) {
      _query = 'UPDATE sub_receipts SET status = ? WHERE id = ?';
      
    } else {
      _query = 'UPDATE receipts SET status = ? WHERE id = ? ';      
    }

    let _values = [ 3, id ];
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })
    if(!_result) return common.send(res, 300, '', 'Database Error');

    const _receipt = await receiptModel.getAdminHistoryByLimit( employee_id, limit );
    return common.send(res, 200, _receipt, 'Success');

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function accept (req, res, next) {
  var employee_id = res.locals.id;

  var params = req.body;
  const { isHasSub, id, p_id } = params;
  
  try {
    const _employee = await employeeModel.findUserById(employee_id);
    if(!_employee) return common.send(res, 300, '', 'Employee not found');
    
    const _receipt = await receiptModel.findReceiptById(p_id);
    if(!_receipt) return common.send(res, 300, '', 'Receipt not found');

    const _orders = await orderModel.findOrdersByReceiptId(p_id);
    if(!_orders) return common.send(res, 300, '', 'Orders not found');
    
    let sub_receipts = {};
    if(isHasSub === 1){
      sub_receipts = await subReceiptModel.findBillByReceiptIdAndSubId(p_id, id);
      if(!sub_receipts) return common.send(res, 300, '', 'Sub Receipt not found');
    }    

    let payload = {
      employee: _employee ,
      receipt: _receipt,
      orders: _orders,
      sub_receipts
    }
    
    return common.send(res, 200, payload, 'Success')

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function nfc (req, res, next) {
  
  const { receipt_id, sub_receipt_id, cost, card } = req.body;
  const { cardNumber, expYear, expMonth, cvc, holder } = card;

  // var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var created_at = Math.ceil( new Date().getTime() / 1000 );
  
  try {
    var stripe_token = await stripe.tokens.create({
      card: {
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc: cvc,
      },
    })

    var charge = await stripe.charges.create({
      amount: Math.ceil(cost * 100),
      currency: 'usd',
      source: stripe_token.id,
    })

    if ( charge ) {
      if( sub_receipt_id > 0 ) {
        let _query = 'UPDATE sub_receipts SET status = ?, transaction_id = ?, paid_date = ? WHERE id = ? AND parent_receipt_id = ? ';
        let _values = [ 1, charge.id, created_at, sub_receipt_id, receipt_id ];
        let _result = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? true : false);
          })
        })
        if(!_result) return common.send(res, 300, '', 'Database Error');
      } else {
        let _query = 'UPDATE receipts SET status = ?, transaction_id = ?, paid_date = ? WHERE id = ? ';
        let _values = [ 1, charge.id, created_at, receipt_id ];
        let _result = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? true : false);
          })
        })
        if(!_result) return common.send(res, 300, '', 'Database Error');
      }
      return common.send(res, 200, true, 'Success');
    }
  } catch (err) {
    // save the data when decline the payment
    if( sub_receipt_id > 0 ) {
      let _query = 'UPDATE sub_receipts SET status = ?, paid_date = ? WHERE id = ? AND parent_receipt_id = ? ';
      let _values = [ 2, created_at, sub_receipt_id, receipt_id ];
      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        })
      })
      if(!_result) return common.send(res, 300, '', 'Database Error');
    } else {
      let _query = 'UPDATE receipts SET status = ?, paid_date = ? WHERE id = ? ';
      let _values = [ 2, created_at, receipt_id ];
      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        })
      })
      if(!_result) return common.send(res, 300, '', 'Database Error');
    }
    
    return common.send(res, 400, '', 'Decline Payment: ' + err);
  }
}

module.exports = {
  orders,
  get,
  split,
  loadHistory,
  search,
  cancelTransaction,
  refund,
  accept,
  nfc
}