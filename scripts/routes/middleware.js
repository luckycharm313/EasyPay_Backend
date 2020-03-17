
var common = require('../../config/common');
var constants = require('../../config/constants');
var jwt = require("jsonwebtoken");

function auth(req, res, next) {
  if( req.headers['token'] === undefined || req.headers['token'] === '') return common.send(res, 300, '', 'There is no authenticate token.');
  
  jwt.verify(req.headers['token'], constants.SECURITY_KEY, function(err, decoded) {
    if( err ) {
      return common.send(res, 300, '', 'There is no authenticate token.');      
    } else {
      res.locals.user_id = decoded.id;
      return next();
    }
  });
   
}

function admin(req, res, next) {
  if( req.headers['token'] === undefined || req.headers['token'] === '') return common.send(res, 300, '', 'There is no authenticate token.');
  
  jwt.verify(req.headers['token'], constants.SECURITY_KEY, function(err, decoded) {
    if( err ) {
      return common.send(res, 300, '', 'There is no authenticate token.');      
    } else {
      res.locals.employee_id = decoded.id;
      res.locals.self_id = decoded.self_id;
      return next();
    }
  });
   
}

module.exports = {
  auth,
  admin
}