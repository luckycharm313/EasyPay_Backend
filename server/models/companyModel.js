var Promise = require('promise');
var DB = require('../../config/database');

module.exports = {
  findCompanyByBizName: function ( biz_name ) {

    var query = 'SELECT * FROM companies WHERE biz_name = ?';
    var values = [biz_name];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data [0] : null);
      })
    });
  },
  getCompanyList: function(status) {
    var query = '';
    var values = [];
    if(status === -1){
      query = 'SELECT * FROM companies';
      values = [];
    } else {
      query = 'SELECT * FROM companies WHERE status = ?';
      values = [status];
    }
    
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data : []);
      })
    });
  },
  getProductsByCompanyId: function(id) {
    var query = 'SELECT * FROM products WHERE company_id = ?';
    var values = [id];
    
    return new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.length > 0 ? data : []);
      })
    });
  }
}