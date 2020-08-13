var moment = require('moment')
var common = require('../../../config/common')
var Promise = require('promise')
var DB = require('../../../config/database')
var constants = require('../../../config/constants')
var employeeModel = require('../../models/employeeModel')
var messageModel = require('../../models/messageModel')

const stripe = require('stripe')(constants.STRIPE_SECURITY_KEY);

async function sendAnnouncement (req, res, next) {
  var employee_id = res.locals.employee_id;

  var params = req.body;
  const {  array_receipt_no, announce, receipt_date, day, month, year } = params;
  
  let array_receipt = []
  let array_sub_receipt = [];
  let startDate = '';
  let endDate = '';

  array_receipt_no.length > 0 && array_receipt_no.forEach(element => {
    var res = element.toString().split('-');
    if (res.length === 2) {
      array_sub_receipt.push(res[1]);
    } else {
      array_receipt.push(element);
    }
  });

  if(receipt_date){
    startDate = moment(new Date(receipt_date)).unix();    
    if( day !== '') {
      endDate = moment(new Date(receipt_date)).add(1, 'day').unix();
    }
    
    if( day === '' && month !== '') {
      endDate = moment(new Date(receipt_date)).add(1, 'month').unix();
    }
  
    if( day === '' && month === ''){
      endDate = moment(new Date(receipt_date)).add(1, 'year').unix();
    }
  }
  
  var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    const _employee = await employeeModel.findUserById(employee_id);
    if(!_employee) return common.send(res, 300, '', 'Employee not found');
    let users_block = _employee['users_block'];
    var arr_users_block = users_block ? users_block.toString().split(',') : [];
    
    const _users = await messageModel.getAnnounceUsers(employee_id, array_receipt, array_sub_receipt, startDate, endDate, arr_users_block);
    console.log({_users})
    let insertData = [];
    let arrayPushNotification = [];
    _users.length > 0 && _users.forEach( e => {
      insertData.push([ announce, e.user_id, employee_id, e.r_no, e.sr_no, e.is_sub_receipt, created_at, updated_at ]);
      if(e.push_token) arrayPushNotification.push(e.push_token);
    })

    let _query = 'INSERT INTO announcements ( announce, user_id, employee_id, receipt_no, sub_receipt_no, has_subreceipt, created_at, updated_at) VALUES ?';
    let _values = [ insertData ];
    
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? data.insertId : false);
      })
    })
    if (!_result) return common.send(res, 300, '', 'Database error');

    let sendPushData = {
      title: `${_employee['biz_name']} sent you an announcement.`,
      body: announce
    }
    common.sendMessageThroughFCM(arrayPushNotification, sendPushData, function (response) {
      console.log('push notification response => ', response);
    })
    return common.send(res, 200, '', 'Success')

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}
async function getAnnounceHistory (req, res, next) {
  var employee_id = res.locals.employee_id;

  var params = req.body;
  const { limit } = params;
  try {
    const _employee = await employeeModel.findUserById(employee_id);
    if(!_employee) return common.send(res, 300, '', 'Employee not found');
    
    const _announce = await messageModel.getAnnounceByEmployee(employee_id, limit);

    return common.send(res, 200, _announce, 'Success')

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function deleteAnnounce (req, res, next) {
  var employee_id = res.locals.employee_id;

  var params = req.body;
  const { limit, deleted_id } = params;
  try {
    const _employee = await employeeModel.findUserById(employee_id);
    if(!_employee) return common.send(res, 300, '', 'Employee not found');
    
    var result = await messageModel.deleteAnnounceById(deleted_id);
    if(result){
      const _announce = await messageModel.getAnnounceByEmployee(employee_id, limit);
      return common.send(res, 200, _announce, 'Success')
    }
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}
module.exports = {
  sendAnnouncement,
  getAnnounceHistory,
  deleteAnnounce
}