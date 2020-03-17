var Promise = require('promise');
var DB = require('../../config/database');

module.exports = {
  findOrdersByReceiptId: function ( id ) {

    var query = 'SELECT * FROM orders WHERE receipt_id = ? ';
    var values = [id];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data : null);
      })
    });
  },
}