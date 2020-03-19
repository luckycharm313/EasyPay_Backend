var moment = require('moment');
var phoneNumberToken = require('generate-sms-verification-code');
var common = require('../../config/common');
var jwt = require("jsonwebtoken");
var Promise = require('promise');
var DB = require('../../config/database');
var constants = require('../../config/constants');
var userModel = require('../models/userModel')

var twilioClient = require('twilio')(constants.TWILIO_ACCOUNT_SID, constants.TWILIO_AUTH_TOKEN)

async function phone (req, res, next) {
  var params = req.body;
  const { phone } = params;
  let code = phoneNumberToken(4);

  twilioClient.messages
    .create({
      body: `Your EasyPay verification code is ${code}`,
      from: constants.FROM_NUMBER,
      to: phone 
    })
    .then(message => {
      var payload = {
        phone,
        code
      }
      return common.send(res, 200, payload, 'success');
    })
    .catch(err => {
      console.log('sms err', err)
      return common.send(res, 300, '', 'Sending SMS failed : ' + err);
    });
}

async function verify (req, res, next) {
  var params = req.body;
  const { phone } = params;
  
  var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    const _user = await userModel.findUserByPhone(phone);
    if(_user) {
      let token = jwt.sign({ id: _user.id }, constants.SECURITY_KEY, { expiresIn: 60 * 60 * 24 * 365 })

      let _query = 'UPDATE users SET token = ?, updated_at = ? WHERE phone = ? ';
      let _values = [ token, updated_at, phone ];
      
      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        })
      })

      if (!_result) return common.send(res, 300, '', 'Database error');

      return common.send(res, 200, token, 'Success');

    } else {
      let _query = 'INSERT INTO users ( phone, user_type, created_at, updated_at) VALUES (?, ?, ?, ?)';
      let _values = [ phone, 1, created_at, updated_at];
      
      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        })
      })

      if (!_result) return common.send(res, 300, '', 'Database error');
      
      return common.send(res, 200, null, 'Success');
    }

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function addUserInfo (req, res, next) {
  var params = req.body;
  const { phone, email, zip_code, stripe_token } = params;
  
  var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    const _user = await userModel.findUserByPhone(phone);
    if(!_user) return common.send(res, 300, '', 'User not found');
    
    let token = jwt.sign({ id: _user.id }, constants.SECURITY_KEY, { expiresIn: 60 * 60 * 24 * 365 })

    let _query = 'UPDATE users SET token = ?, email = ?, zip_code = ?, stripe_token = ?,  updated_at = ? WHERE phone = ? ';
    let _values = [ token, email, zip_code, JSON.stringify(stripe_token), updated_at, phone ];
    
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })

    if (!_result) return common.send(res, 300, '', 'Database error');
    
    return common.send(res, 200, token, 'Success');
    
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}
module.exports = {
  phone,
  verify,
  addUserInfo
}