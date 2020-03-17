var moment = require('moment');
var common = require('../config/common');
var jwt = require("jsonwebtoken");
var Promise = require('promise');
var DB = require('../config/database');
var constants = require('../config/constants');
var userModel = require('../models/userModel')

var twilioClient = require('twilio')(constants.TWILIO_ACCOUNT_SID, constants.TWILIO_AUTH_TOKEN)

async function phone (req, res, next) {
  var params = req.body;
  const { phone } = params;
  let code = '';
  
  twilioClient.messages
    .create({
      body: `Your EasyPay verification code is ${code}`,
      from: constants.FROM_NUMBER,
      to: phone 
    })
    .then(message => {
      return common.send(res, 200, '', 'success');
    })
    .catch(err => {
      console.log('sms err', err)
      return common.send(res, 300, '', 'Sending SMS failed : ' + err);
    });
}

module.exports = {
  phone,
}