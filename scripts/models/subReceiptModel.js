var Promise = require('promise');
var DB = require('../../config/database');

module.exports = {
  findBillByReceiptId: function ( id ) {

    var query = 'SELECT * FROM sub_receipts WHERE parent_receipt_id = ? ';
    var values = [id];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data : null);
      })
    });
  },
}