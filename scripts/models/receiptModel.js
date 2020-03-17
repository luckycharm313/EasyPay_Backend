var Promise = require('promise');
var DB = require('../../config/database');

module.exports = {
  findReceiptById: function ( id ) {

    var query = 'SELECT * FROM receipts WHERE id = ?';
    var values = [id];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data [0] : null);
      })
    });
  },
}