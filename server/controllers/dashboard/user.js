var moment = require("moment");
var common = require("../../../config/common");
var DB = require("../../../config/database");
var userModel = require("../../models/userModel");

async function getList(req, res, next) {
  try {
    const _users = await userModel.getAllUsers();
    return common.send(res, 200, _users, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function deleteUser(req, res, next) {
  var params = req.body;
  const { index } = params;

  try {
    let del_query = "DELETE FROM users WHERE id = ? ";
    let del_values = [index];

    let del_result = await new Promise(function (resolve, reject) {
      DB.query(del_query, del_values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });

    if (!del_result) return common.send(res, 300, "", "Database Error");

    const _users = await userModel.getAllUsers();
    return common.send(res, 200, _users, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function blockUser(req, res, next) {
  var params = req.body;
  const { index, isBlock } = params;

  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    let _query = "UPDATE users SET isBlock = ?, updated_at = ? WHERE id = ? ";
    let _values = [isBlock, updated_at, index];

    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });
    if (!_result) return common.send(res, 300, "", "Database Error");

    const _users = await userModel.getAllUsers();
    return common.send(res, 200, _users, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function getAdminList(req, res, next) {
  try {
    const _admins = await userModel.getAdminList();
    return common.send(res, 200, _admins, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function deleteAdmin(req, res, next) {
  var params = req.body;
  const { index } = params;

  try {
    let del_query = "DELETE FROM admins WHERE id = ? ";
    let del_values = [index];

    let del_result = await new Promise(function (resolve, reject) {
      DB.query(del_query, del_values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });

    if (!del_result) return common.send(res, 300, "", "Database Error");

    const _admins = await userModel.getAdminList();
    return common.send(res, 200, _admins, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

module.exports = {
  getList,
  blockUser,
  deleteUser,
  getAdminList,
  deleteAdmin,  
};
