var Promise = require('promise');
var DB = require('../../config/database');

module.exports = {
  getAnnounceUsers: function ( employee_id, array_receipt, array_sub_receipt, startDate, endDate, arr_users_block ) {
    var query = '';
    var values = [];
    if( startDate !== '' && endDate !== '' ) {
      query = `
        SELECT users.push_token, users.allow_notification, receiptTable.*
        FROM (
          SELECT user_id, receipts.id AS r_no, 0 AS sr_no, receipts.is_sub_receipt AS is_sub_receipt
          FROM receipts 
          WHERE paid_date != '' AND employee_id = ? AND ( id IN (?) OR (paid_date > ? AND paid_date < ?))
          GROUP BY receipts.user_id
          UNION
          SELECT sr.user_id, sr.parent_receipt_id AS r_no, sr.id AS sr_no, 0 AS is_sub_receipt 
          FROM sub_receipts AS sr 
          LEFT JOIN receipts AS r ON r.id = sr.parent_receipt_id 
          WHERE sr.paid_date != '' AND r.employee_id = ? AND ( sr.id IN (?) OR (sr.paid_date > ? AND sr.paid_date < ?))
          GROUP BY sr.user_id
        ) as receiptTable
        LEFT JOIN users ON receiptTable.user_id = users.id 
        WHERE users.user_type = 1 AND users.id NOT IN (?)
      `;
      values = [employee_id, array_receipt.join(), startDate, endDate, employee_id, array_sub_receipt.join(), startDate, endDate, arr_users_block.join()];
    } else {
      query = `
        SELECT users.push_token, users.allow_notification, receiptTable.*
        FROM (
          SELECT user_id, receipts.id AS r_no, 0 AS sr_no, receipts.is_sub_receipt AS is_sub_receipt 
          FROM receipts 
          WHERE paid_date != '' AND employee_id = ? AND id IN (?)
          GROUP BY receipts.user_id
          UNION
          SELECT sr.user_id, sr.parent_receipt_id AS r_no, sr.id AS sr_no, 0 AS is_sub_receipt 
          FROM sub_receipts AS sr 
          LEFT JOIN receipts AS r ON r.id = sr.parent_receipt_id 
          WHERE sr.paid_date != '' AND r.employee_id = ? AND sr.id IN (?)
          GROUP BY sr.user_id
        ) as receiptTable
        LEFT JOIN users ON receiptTable.user_id = users.id 
        WHERE users.user_type = 1 AND users.id NOT IN (?)
      `;
      values = [employee_id, array_receipt.join(), employee_id, array_sub_receipt.join(), arr_users_block.join()];
    }
        
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data : []);
      })
    });
  },
  getNotifications: function( user_id, limit ) {
    var query = `
    SELECT announcements.*, employee.biz_name, employee.users_block 
    FROM announcements 
    LEFT JOIN employee ON announcements.employee_id = employee.id
    WHERE announcements.user_id = ? ORDER BY announcements.created_at DESC LIMIT ?
    `;
    var values = [user_id, limit];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else{
          resolve(data.length > 0 ? data : []);
        } 
      })
    });
  },
  getAnnounceByEmployee: function( employee_id, limit ) {
    var query = `
    SELECT announcements.*, users.allow_notification, users.firstName, users.lastName, employee.users_block 
    FROM announcements 
    LEFT JOIN employee ON announcements.employee_id = employee.id
    LEFT JOIN users ON announcements.user_id = users.id
    WHERE announcements.employee_id = ? ORDER BY announcements.created_at DESC LIMIT ?
    `;
    var values = [employee_id, limit];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else{
          resolve(data.length > 0 ? data : []);
        } 
      })
    });
  },
  deleteAnnounceById: function( id ) {
    var query = `
    DELETE FROM announcements WHERE id = ? 
    `;
    var values = [id];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else{
          resolve(data.affectedRows > 0 ? true : false);
        } 
      })
    });
  }
}