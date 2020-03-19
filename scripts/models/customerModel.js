var Promise = require('promise');
var DB = require('../../config/database');

module.exports = {
  findCustomerByPhone: function ( phone ) {

    var query = 'SELECT * FROM customers WHERE phone = ?';
    var values = [phone];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data [0] : null);
      })
    });
  },
}