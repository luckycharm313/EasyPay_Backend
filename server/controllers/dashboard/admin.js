var moment = require('moment')
var common = require('../../../config/common')
var jwt = require("jsonwebtoken")
var passwordHash = require('password-hash')
var Promise = require('promise')
var DB = require('../../../config/database')
var constants = require('../../../config/constants')
var adminModel = require('../../models/adminModel')

async function register (req, res, next) {
  var params = req.body;
  const { email, password } = params;

  var _password = passwordHash.generate(password);
  var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    const _admin = await adminModel.findAdminByEmail(email);

    if( _admin ) return common.send(res, 300, '', 'Already registered');

    var query = 'INSERT INTO admins ( email, password, created_at, updated_at) VALUES (?, ?, ?, ?)';
    var values = [ email, _password, created_at, updated_at];
    
    var result = await new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })

    if (!result) return common.send(res, 300, '', 'Database error');

    return common.send(res, 200, true, 'Success');

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function login (req, res, next) {
  var params = req.body;
  const { email, password } = params;

  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    
    const _admin = await adminModel.findAdminByEmail(email);
    if( !_admin ) return common.send(res, 300, '', "User doesn't exist");

    if ( passwordHash.verify(password, _admin.password) ) {
        
      var token = jwt.sign({ id: _admin.id }, constants.SECURITY_KEY, { expiresIn: 60 * 60 * 24 * 365 });
      
      var query = 'UPDATE admins SET token = ?, updated_at = ? WHERE id = ? ';
      var values = [ token, updated_at, _admin.id ];
      
      var result = await new Promise(function (resolve, reject) {
        DB.query(query, values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        })      
      })
      
      if ( !result ) return common.send(res, 300, '', 'Update database error');
      const _admin_ = await adminModel.findAdminByEmail(email);

      return common.send(res, 200, _admin_, 'success');

    } else {
      return common.send(res, 300, '', 'Invalid Password');
    }  
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}


async function getAdminProfile(req, res, next) {
  var admin_id = res.locals.admin_id;
  try {
    const _adminInfo = await adminModel.getAdminProfile(admin_id);
    return common.send(res, 200, _adminInfo, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function updateAdminProfile(req, res, next) {
  var admin_id = res.locals.admin_id;
  const { firstName, lastName, photo, email } = req.body;

  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  try {

    var query = 'UPDATE admins SET firstName=?, lastName=?, photo=?, email=?, updated_at=? WHERE id = ? ';
    var values = [ firstName, lastName, photo, email, updated_at, admin_id ];
    
    var result = await new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })      
    })
    
    if ( !result ) return common.send(res, 300, '', 'Update database error');

    const _adminInfo = await adminModel.getAdminProfile(admin_id);
    return common.send(res, 200, _adminInfo, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function forgot(req, res, next) {
  const { email } = req.body;
  // let url = "http://localhost:3000/reset";
  let url = "https://easypayplatformorg.biz/reset";

  try {
    let subject = 'Reset Password';
    let html = `
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
            integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
          <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"
            integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
            crossorigin="anonymous"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"
            integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
            crossorigin="anonymous"></script>
          <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"
            integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
            crossorigin="anonymous"></script>
        </head>
        
        <body>
          <style type="text/css">
            .txt-primary {
              color: #00020A;
              font-size: 16px;
            }
        
            .txt-secondary {
              color: #00020A;
              font-size: 14px;
            }
        
            .txt-address {
              color: #00020A;
              font-size: 12px;
            }
          </style>
          <div class="container">
            <div class="row">
              <img alt="EasyPay" class="mt-5"
                src="https://easypay.s3.us-east-2.amazonaws.com/app_logo.png" width="80" height="22.9" />
            </div>
            <div class="row mt-3">
              <h6 class="txt-primary">Reset Password</h6>
            </div>
            <div class="row mt-4 flex-column">
              <p class="txt-secondary">We sent you this email because you indicated that you forgot your password. Ignore if this was on accident.</p>
              <p class="txt-secondary">Click the link <a href="${url}">here</a> to continue with changing your password. </p>
              <p class="txt-secondary mt-4">Warm Regards,</p>
              <p class="txt-secondary">EasyPay Team.</p>
            </div>
            <div class="row flex-column pt-4" style="margin-top: 8%; border-top: 1px solid #000002;">
              <p class="txt-address mb-0">1692 Coastal Highway, Lewes, DE 19958</p>
              <p class="txt-address">©2020 EasyPay Platform LLC.</p>
            </div>
          </div>
        </body>        
    </html>
    `;
    common.sendEmail(email, subject, html);

    return common.send(res, 200, true, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function reset(req, res, next) {
  const { email, password } = req.body;
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var _password = passwordHash.generate(password);

  try {
    var query = 'UPDATE admins SET password=?, updated_at=? WHERE email = ? ';
    var values = [ _password, updated_at, email ];
    
    var result = await new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })      
    })
    
    if ( !result ) return common.send(res, 300, '', 'Update database error');

    return common.send(res, 200, true, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

module.exports = {
  register,
  login,
  getAdminProfile,
  updateAdminProfile,
  forgot,
  reset
}