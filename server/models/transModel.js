var Promise = require('promise');
var DB = require('../../config/database');
const { func } = require('prop-types');

module.exports = {
  getTransList: function() {
    var query = `
      SELECT ec.*, receipts.total, receipts.id as r_id, receipts.status, receipts.created_at, 0 as sb_id, receipts.is_sub_receipt
      FROM receipts 
      LEFT JOIN (
        SELECT employee.id, companies.biz_name, employee.employee_name, employee.employee_id 
        FROM employee 
        LEFT JOIN companies 
        ON companies.id = employee.company_id) AS ec 
      ON ec.id = receipts.employee_id
      WHERE receipts.is_sub_receipt = 0
      UNION
      SELECT ec.*, s_r.cost, s_r.parent_receipt_id, s_r.status, s_r.created_at, s_r.sb_id, s_r.is_sub_receipt
      FROM (
        SELECT sub_receipts.cost, sub_receipts.parent_receipt_id, sub_receipts.status, sub_receipts.created_at, sub_receipts.id as sb_id, receipts.is_sub_receipt, receipts.employee_id
        FROM sub_receipts
        LEFT JOIN receipts
        ON sub_receipts.parent_receipt_id = receipts.id
        WHERE receipts.is_sub_receipt = 1
      ) as s_r
      LEFT JOIN (
        SELECT employee.id, companies.biz_name, employee.employee_name, employee.employee_id
        FROM employee 
        LEFT JOIN companies 
        ON companies.id = employee.company_id) AS ec 
      ON ec.id = s_r.employee_id
    `;
    var values = [];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data : []);
      })
    });
  },
  getTransDetail: function (id) {
    var query = `
      SELECT ec.*, receipts.tip, receipts.total, receipts.paid_date, receipts.is_sub_receipt, receipts.status, receipts.created_at, receipts.user_id, receipts.id, receipts.sub_total
      FROM receipts 
      LEFT JOIN (
        SELECT companies.biz_name, companies.biz_phone, companies.biz_email, companies.biz_address, companies.tax, employee.id,  employee.employee_name, employee.employee_id 
        FROM employee 
        LEFT JOIN companies 
        ON companies.id = employee.company_id) AS ec 
      ON ec.id = receipts.employee_id
      WHERE receipts.id = ?
    `;
    var values = [id];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data[0] : []);
      })
    });
  },
  getSubTransDetail: function (sub_id) {
    var query = `
    SELECT ec.*, s_r.*
    FROM (
      SELECT sub_receipts.cost, sub_receipts.parent_receipt_id, sub_receipts.status, sub_receipts.created_at, sub_receipts.id as sb_id, receipts.is_sub_receipt, receipts.employee_id as e_id, sub_receipts.tip, receipts.sub_total, sub_receipts.user_id, sub_receipts.paid_date, receipts.total
      FROM sub_receipts
      LEFT JOIN receipts
      ON sub_receipts.parent_receipt_id = receipts.id
    ) as s_r
    LEFT JOIN (
      SELECT employee.id, companies.biz_name, companies.biz_phone, companies.biz_email, companies.biz_address, companies.tax,  employee.employee_name, employee.employee_id
      FROM employee 
      LEFT JOIN companies 
      ON companies.id = employee.company_id) AS ec 
    ON ec.id = s_r.e_id
    WHERE s_r.sb_id = ?
  `;
  var values = [sub_id];
  
  return new Promise(function (resolve, reject) {
    DB.query(query, values, function (err, data) {
      if (err) reject(err);
      else resolve(data.length > 0 ? data[0] : []);
    })
  });
  },
}