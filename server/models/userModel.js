var Promise = require('promise');
var DB = require('../../config/database');

module.exports = {
  findUserByPhone: function ( phone ) {
    var query = 'SELECT * FROM users WHERE phone = ? AND user_type = ?';
    var values = [phone.replace(/\s/g, ''), 1];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data [0] : null);
      })
    });
  },
  findUserById: function ( id ) {

    var query = 'SELECT * FROM users WHERE id = ?';
    var values = [id];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data [0] : null);
      })
    });
  },
  findUserByEmail: function ( email ) {

    var query = 'SELECT * FROM users WHERE email = ?';
    var values = [email];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data [0] : null);
      })
    });
  },
  getAllUsers: function () {

    var query = 'SELECT * FROM users WHERE user_type = ?';
    var values = [1];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data : []);
      })
    });
  },
  getAdminList: function () {

    var query = 'SELECT * FROM admins WHERE permission=?';
    var values = [0];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data : []);
      })
    });
  },
}