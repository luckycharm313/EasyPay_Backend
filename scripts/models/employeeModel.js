var Promise = require('promise');
var DB = require('../../config/database');

module.exports = {
  findUserBySelfId: function ( selfId, companyId ) {

    var query = 'SELECT * FROM employee WHERE self_id = ? AND company_id = ?';
    var values = [selfId, companyId];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data [0] : null);
      })
    });
  },
  findUserById: function ( id ) {

    var query = 'SELECT * FROM employee WHERE id = ?';
    var values = [id];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data [0] : null);
      })
    });
  },
  findManagerById: function ( manager_id, manager_pin, id ) {

    var query = 'SELECT * FROM employee WHERE manager_id =? AND manager_pin = ? AND id = ?';
    var values = [manager_id, manager_pin, id];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data [0] : null);
      })
    });
  },
}