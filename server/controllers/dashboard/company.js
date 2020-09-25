var moment = require("moment");
var common = require("../../../config/common");
var Promise = require("promise");
var DB = require("../../../config/database");
var companyModel = require("../../models/companyModel");
const employeeModel = require("../../models/employeeModel");

async function postCompanyInfo(req, res, next) {
  var params = req.body;
  const {
    biz_name,
    biz_phone,
    biz_address,
    biz_email,
    biz_pin,
    tax,
    arr_employee,
    arr_item,
  } = params;
  console.log({ params });
  var created_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    const _company = await companyModel.findCompanyByBizName(biz_name);
    if (_company) return common.send(res, 300, "", "Already registered");

    var query =
      "INSERT INTO companies ( biz_name, biz_phone, biz_address, biz_email, biz_pin, tax, employee_ids, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    var values = [
      biz_name,
      biz_phone,
      biz_address,
      biz_email,
      biz_pin,
      tax,
      arr_employee.toString(),
      created_at,
      updated_at,
    ];

    var lastId = await new Promise(function (resolve, reject) {
      DB.query(query, values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? data.insertId : false);
      });
    });

    if (!lastId) return common.send(res, 300, "", "Database error");

    var _values = [];
    let _query =
      "INSERT INTO products ( company_id, item, price, created_at, updated_at) VALUES ?";
    arr_item.forEach((element) => {
      _values.push([
        lastId,
        element.item,
        element.price,
        created_at,
        updated_at,
      ]);
    });

    var result = await new Promise(function (resolve, reject) {
      DB.query(_query, [_values], function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });

    return result
      ? common.send(res, 200, "Success", "Success")
      : common.send(res, 300, false, "Database error");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function getList(req, res, next) {
  const { status } = req.body;
  try {
    const _company = await companyModel.getCompanyList(status);
    return common.send(res, 200, _company, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function getProductsByCompany(req, res, next) {
  var params = req.body;
  const { index } = params;

  try {
    const _products = await companyModel.getProductsByCompanyId(index);
    return common.send(res, 200, _products, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function updateProduct(req, res, next) {
  var params = req.body;
  const { company_id, item, price, product_id } = params;

  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    let _query =
      "UPDATE products SET item = ?, price= ?, updated_at = ? WHERE id = ? ";
    let _values = [item, price, updated_at, product_id];

    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });
    if (!_result) return common.send(res, 300, "", "Database Error");

    const _products = await companyModel.getProductsByCompanyId(company_id);
    return common.send(res, 200, _products, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function addProduct(req, res, next) {
  var params = req.body;
  const { company_id, item, price } = params;

  var created_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    let _query =
      "INSERT INTO products ( company_id, item, price, created_at, updated_at) VALUES (?, ?, ?, ?, ?)";
    let _value = [company_id, item, price, created_at, updated_at];

    var _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _value, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });

    if (!_result) return common.send(res, 300, "", "Database Error");

    const _products = await companyModel.getProductsByCompanyId(company_id);
    return common.send(res, 200, _products, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function deleteProduct(req, res, next) {
  var params = req.body;
  const { company_id, product_id } = params;

  try {
    let del_query = "DELETE FROM products WHERE id = ? ";
    let del_values = [product_id];

    let del_result = await new Promise(function (resolve, reject) {
      DB.query(del_query, del_values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });

    if (!del_result) return common.send(res, 300, "", "Database Error");

    const _products = await companyModel.getProductsByCompanyId(company_id);
    return common.send(res, 200, _products, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function deleteCompany(req, res, next) {
  var params = req.body;
  const { index, status } = params;
  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
  try {
    if( status === 1 ) {
      let del_query = "DELETE FROM companies WHERE id = ? ";
      let del_values = [index];
  
      let del_result = await new Promise(function (resolve, reject) {
        DB.query(del_query, del_values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        });
      });
      if (!del_result) return common.send(res, 300, "", "Database Error");

    } else {
      let _query =
        "UPDATE companies SET status = ?, updated_at = ? WHERE id = ? ";
      let _values = [1, updated_at, index];

      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        });
      });
      if (!_result) return common.send(res, 300, "", "Database Error");

      let _emp_ = await employeeModel.findEmployeeByCompanyId(index);
      let sendData = {
        isLogout: true,
      }
      let receivers = [];
      _emp_.forEach(e => {
        receivers.push(e.push_token);
      });
      common.sendDataThroughFCMByType(receivers, sendData, 1, function (response) {
        console.log('push data response => ', response);
      })
    }
    
    const _company = await companyModel.getCompanyList(status);
    return common.send(res, 200, _company, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function updateCompany(req, res, next) {
  var params = req.body;
  const {
    company_id,
    biz_name,
    biz_phone,
    biz_address,
    biz_email,
    biz_pin,
    tax,
    arr_employee,
    status,
    isUndo,
  } = params;
  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    if(isUndo) {
      let _query =
      "UPDATE companies SET status=?, updated_at = ? WHERE id = ? ";
      let _values = [
        0,
        updated_at,
        company_id,
      ];

      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        });
      });
      if (!_result) return common.send(res, 300, "", "Database Error");
    } else {
      let _query =
      "UPDATE companies SET biz_name=?, biz_phone=?, biz_address=?, biz_email=?, biz_pin=?, tax=?, employee_ids=?, updated_at = ? WHERE id = ? ";
      let _values = [
        biz_name,
        biz_phone,
        biz_address,
        biz_email,
        biz_pin,
        tax,
        arr_employee.toString(),
        updated_at,
        company_id,
      ];

      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        });
      });
      if (!_result) return common.send(res, 300, "", "Database Error");
    }
    
    const _company = await companyModel.getCompanyList(status);
    return common.send(res, 200, _company, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

module.exports = {
  postCompanyInfo,
  getList,
  getProductsByCompany,
  updateProduct,
  addProduct,
  deleteProduct,
  updateCompany,
  deleteCompany,
};
