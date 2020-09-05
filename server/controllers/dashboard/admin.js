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

module.exports = {
  register,
  login,
  getAdminProfile,
  updateAdminProfile
}