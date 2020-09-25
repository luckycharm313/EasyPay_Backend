var Promise = require('promise');
var DB = require('../../config/database');

module.exports = {
  findUserByEmployeeId: function ( employee_id, companyId ) {

    var query = 'SELECT * FROM employee WHERE employee_id = ? AND company_id = ?';
    var values = [employee_id, companyId];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data [0] : null);
      })
    });
  },
  findUserById: function ( id ) {

    var query = `SELECT * FROM employee LEFT JOIN companies ON employee.company_id = companies.id WHERE employee.id = ?`;
    var values = [id];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data [0] : null);
      })
    });
  },
  findManagerById: function ( pin, id ) {

    var query = 'SELECT * FROM employee LEFT JOIN companies ON employee.company_id = companies.id WHERE companies.biz_pin = ? AND employee.id = ?';
    var values = [pin, id];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data [0] : null);
      })
    });
  },
  findEmployeeByCompanyId: function ( id ) {
    var query = `SELECT * FROM employee WHERE company_id = ?`;
    var values = [id];    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data : []);
      })
    });
  },
}