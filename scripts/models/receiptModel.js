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
  getHistoryByLimit: function ( user_id, limit ) {

    var query = `
      SELECT receipt_table.*, employee.biz_name
      FROM (
        SELECT parent_receipts.id, is_sub_receipt, total, paid_date, employee_id 
        FROM (SELECT * FROM receipts WHERE user_id = ? ORDER BY paid_date DESC LIMIT ?) AS parent_receipts 
        WHERE parent_receipts.is_sub_receipt = 0 AND parent_receipts.status = 1
        UNION ALL
        SELECT sub_receipt_table.id, 1, sub_receipt_table.cost, sub_receipt_table.paid_date, sub_receipt_table.employee_id
        FROM ( SELECT sub_receipts.user_id, sub_receipts.id, sub_receipts.cost, sub_receipts.paid_date, sub_receipts.parent_receipt_id, receipts.id as r_id, receipts.employee_id FROM sub_receipts LEFT JOIN receipts ON sub_receipts.parent_receipt_id = receipts.id ) as sub_receipt_table
        WHERE sub_receipt_table.user_id = ? AND sub_receipt_table.parent_receipt_id in (SELECT id FROM (SELECT * FROM receipts WHERE user_id = ? ORDER BY paid_date DESC LIMIT ?) AS parent_receipts WHERE parent_receipts.is_sub_receipt = 1 AND parent_receipts.status = 1)
      ) as receipt_table
      LEFT JOIN employee
      ON receipt_table.employee_id = employee.id
      ORDER BY paid_date DESC;
    `;
    var values = [user_id, limit, user_id, user_id, limit];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else{
          console.log({data})
          resolve(data.length > 0 ? data : null);
        } 
      })
    });
  },
}