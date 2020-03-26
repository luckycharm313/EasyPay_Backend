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

const stripe = require('stripe')(constants.STRIPE_SECURITY_KEY);

async function get (req, res, next) {
  
  var params = req.body;
  const { receipt_id, sub_receipt_id } = params;

  try {

    const _receipt = await receiptModel.findReceiptById(receipt_id);
    if(!_receipt) return common.send(res, 300, '', 'Receipt not found');

    const _employee = await employeeModel.findUserById(_receipt.employee_id);
    if(!_employee) return common.send(res, 300, '', 'Employee not found');

    const _orders = await orderModel.findOrdersByReceiptId(receipt_id);
    if(!_orders) return common.send(res, 300, '', 'Orders not found');

    var sub_receipts = {};

    if(sub_receipt_id > 0 ) {
      sub_receipts = await subReceiptModel.findBillByReceiptIdAndSubId(receipt_id, sub_receipt_id);
      if(!sub_receipts) return common.send(res, 300, '', 'Split Bill not found');
    }

    let payload = {
      employee: _employee,
      receipt: _receipt,
      orders: _orders,
      sub_receipts,
    }
    
    return common.send(res, 200, payload, 'Success');

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function pay (req, res, next) {
  
  var user_id = res.locals.user_id;
  var params = req.body;
  const { receiptInfo, tip, percent } = params;

  // var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var created_at = Math.ceil( new Date().getTime() / 1000 );
  
  try {
    const _user = await userModel.findUserById(user_id);
    if(!_user) return common.send(res, 300, '', 'User not found');

    let receipt = receiptInfo.receipt;
    let sub_receipts = receiptInfo.sub_receipts;
    var amount = 0;
    
    if( Object.keys(sub_receipts).length > 0 ) {
      amount = parseFloat(sub_receipts.cost) + parseFloat(tip);
    } else {
      amount = parseFloat(receipt.total) + parseFloat(tip);
    }
    
    var stripe_token = await stripe.tokens.create({
      card: {
        number: _user.card_number,
        exp_month: _user.card_exp_month,
        exp_year: _user.card_exp_year,
        cvc: _user.card_cvc,
      },
    })

    var charge = await stripe.charges.create({
      amount: Math.ceil(amount * 100),
      currency: 'usd',
      source: stripe_token.id,
    })

    if ( charge ) {
      if( Object.keys(sub_receipts).length > 0 ) {
        let _query = 'UPDATE sub_receipts SET user_id = ?, tip= ?, status = ?, paid_date = ? WHERE id = ? AND parent_receipt_id = ? ';
        let _values = [ user_id, tip, 1, created_at, sub_receipts.id, receipt.id ];
        let _result = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? true : false);
          })
        })
        if(!_result) return common.send(res, 300, '', 'Database Error');
      } else {
        let _query = 'UPDATE receipts SET user_id = ?, tip= ?, status = ?, paid_date = ? WHERE id = ? ';
        let _values = [ user_id, tip, 1, created_at, receipt.id ];
        let _result = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? true : false);
          })
        })
        if(!_result) return common.send(res, 300, '', 'Database Error');
      }

      let original_cost = 0;
    
      if( Object.keys(sub_receipts).length > 0 ) {
        original_cost = parseFloat(sub_receipts.cost);
      } else {
        original_cost = parseFloat(receipt.total);
      }

      let payload = {
        total: parseFloat(original_cost) + parseFloat(tip),
        percent,
        original_cost
      }
      console.log({payload})
      return common.send(res, 200, payload, 'Success');
    }
  } catch (err) {
    // save the data when decline the payment
    let receipt = receiptInfo.receipt;
    let sub_receipts = receiptInfo.sub_receipts;

    if( Object.keys(sub_receipts).length > 0 ) {
      let _query = 'UPDATE sub_receipts SET user_id = ?, tip= ?, status = ?, paid_date = ? WHERE id = ? AND parent_receipt_id = ? ';
      let _values = [ user_id, tip, 2, created_at, sub_receipts.id, receipt.id ];
      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        })
      })
      if(!_result) return common.send(res, 300, '', 'Database Error');
    } else {
      let _query = 'UPDATE receipts SET user_id = ?, tip= ?, status = ?, paid_date = ? WHERE id = ? ';
      let _values = [ user_id, tip, 2, created_at, receipt.id ];
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

async function loadHistory (req, res, next) {
  var user_id = res.locals.user_id;
    
  var params = req.body;
  const { limit } = params;
  console.log(user_id)
  console.log(limit)
  try {
    
    const _receipt = await receiptModel.getHistoryByLimit( user_id, limit );
    if(!_receipt) return common.send(res, 300, '', 'Receipt not found');

    return common.send(res, 200, _receipt, 'Success');

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function payOne (req, res, next) {
  
  var params = req.body;
  const { receiptInfo, tip, percent, user_id } = params;

  // var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var created_at = Math.ceil( new Date().getTime() / 1000 );
  
  try {
    const _user = await userModel.findUserById(user_id);
    if(!_user) return common.send(res, 300, '', 'User not found');

    let receipt = receiptInfo.receipt;
    let sub_receipts = receiptInfo.sub_receipts;
    var amount = 0;
    
    if( Object.keys(sub_receipts).length > 0 ) {
      amount = parseFloat(sub_receipts.cost) + parseFloat(tip);
    } else {
      amount = parseFloat(receipt.total) + parseFloat(tip);
    }
    
    var stripe_token = await stripe.tokens.create({
      card: {
        number: _user.card_number,
        exp_month: _user.card_exp_month,
        exp_year: _user.card_exp_year,
        cvc: _user.card_cvc,
      },
    })

    var charge = await stripe.charges.create({
      amount: Math.ceil(amount * 100),
      currency: 'usd',
      source: stripe_token.id,
    })

    if ( charge ) {
      if( Object.keys(sub_receipts).length > 0 ) {
        let _query = 'UPDATE sub_receipts SET user_id = ?, tip= ?, status = ?, paid_date = ? WHERE id = ? AND parent_receipt_id = ? ';
        let _values = [ user_id, tip, 1, created_at, sub_receipts.id, receipt.id ];
        let _result = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? true : false);
          })
        })
        if(!_result) return common.send(res, 300, '', 'Database Error');
      } else {
        let _query = 'UPDATE receipts SET user_id = ?, tip= ?, status = ?, paid_date = ? WHERE id = ? ';
        let _values = [ user_id, tip, 1, created_at, receipt.id ];
        let _result = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? true : false);
          })
        })
        if(!_result) return common.send(res, 300, '', 'Database Error');
      }

      let original_cost = 0;
    
      if( Object.keys(sub_receipts).length > 0 ) {
        original_cost = parseFloat(sub_receipts.cost);
      } else {
        original_cost = parseFloat(receipt.total);
      }

      let payload = {
        total: parseFloat(original_cost) + parseFloat(tip),
        percent,
        original_cost
      }
      console.log({payload})
      return common.send(res, 200, payload, 'Success');
    }
  } catch (err) {
    // save the data when decline the payment
    let receipt = receiptInfo.receipt;
    let sub_receipts = receiptInfo.sub_receipts;

    if( Object.keys(sub_receipts).length > 0 ) {
      let _query = 'UPDATE sub_receipts SET user_id = ?, tip= ?, status = ?, paid_date = ? WHERE id = ? AND parent_receipt_id = ? ';
      let _values = [ user_id, tip, 2, created_at, sub_receipts.id, receipt.id ];
      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        })
      })
      if(!_result) return common.send(res, 300, '', 'Database Error');
    } else {
      let _query = 'UPDATE receipts SET user_id = ?, tip= ?, status = ?, paid_date = ? WHERE id = ? ';
      let _values = [ user_id, tip, 2, created_at, receipt.id ];
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
  get,
  pay,
  loadHistory,

  // one time payment
  payOne
}