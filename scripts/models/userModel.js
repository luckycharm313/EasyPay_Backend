var Promise = require('promise');
var DB = require('../../config/database');

module.exports = {
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
}