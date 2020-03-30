var Promise = require('promise');
var DB = require('../../config/database');

module.exports = {
  findBillByReceiptId: function ( parent_receipt_id ) {

    var query = 'SELECT * FROM sub_receipts WHERE parent_receipt_id = ? ';
    var values = [parent_receipt_id];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data : null);
      })
    });
  },
  findBillByReceiptIdAndSubId: function ( parent_receipt_id, id ) {

    var query = 'SELECT * FROM sub_receipts WHERE parent_receipt_id = ? AND id = ? ';
    var values = [parent_receipt_id, id];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data[0] : null);
      })
    });
  },
}