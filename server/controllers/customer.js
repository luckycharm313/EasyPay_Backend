var moment = require('moment');
var common = require('../../config/common');
var Promise = require('promise');
var DB = require('../../config/database');
var customerModel = require('../models/customerModel');

async function sendRequest (req, res, next) {
  var params = req.body;
  const { email, name, message } = params;
  
  var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    
    let _query = 'INSERT INTO customers ( email, name, message, created_at, updated_at) VALUES (?, ?, ?, ?, ?)';
    let _values = [ email, name, message, created_at, updated_at];
    
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })

    if (!_result) return common.send(res, 300, '', 'Database error');
    
    /****** sending email */
    if(email){
      var subject = 'Welcome to EasyPay'
      var html = `
        <html>
            <body>
                <p>Hi ${name?name:''}</p>
                <p>Thank you for contacting EasyPay Platform support. We will get back to you as soon as possible.</p>
                <p>Best,</p>                
                <p>Easy Pay Team.</p>                
            </body>
        </html>
      `;
      common.sendEmail(email, subject, html);
    }      
    /***** end */

    return common.send(res, 200, true, 'Success');

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

module.exports = {
  sendRequest,
}