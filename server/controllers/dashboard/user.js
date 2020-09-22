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

async function getCustomerRequest(req, res, next) {
  try {
    const payload = await userModel.getCustomerRequest();
    return common.send(res, 200, payload, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function replyRequest(req, res, next) {
  const { id, response, email, name } = req.body;
  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
  
  try {
    let _query = "UPDATE customers SET response = ?, updated_at = ? WHERE id = ? ";
    let _values = [response, updated_at, id];

    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });
    if (!_result) return common.send(res, 300, "", "Database Error");

    if( email ){
      let subject = 'Response from EasyPay Platform';
      let html = `
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
              integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
            <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"
              integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
              crossorigin="anonymous"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"
              integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
              crossorigin="anonymous"></script>
            <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"
              integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
              crossorigin="anonymous"></script>
          </head>
          
          <body>
            <style type="text/css">
              .txt-primary {
                color: #00020A;
                font-size: 16px;
              }
          
              .txt-secondary {
                color: #00020A;
                font-size: 14px;
              }
          
              .txt-address {
                color: #00020A;
                font-size: 12px;
              }
            </style>
            <div class="container">
              <div class="row">
                <img alt="EasyPay" class="mt-5"
                  src="https://easypay.s3.us-east-2.amazonaws.com/app_logo.png" width="80" height="22.9" />
              </div>
              <div class="row mt-3">
                <h6 class="txt-primary">Response from EasyPay Platform</h6>
              </div>
              <div class="row mt-4 flex-column">
                <p class="txt-secondary">Hi, ${name}</p>
                <p class="txt-secondary">${response}</p>
                <p class="txt-secondary mt-4">Warm Regards,</p>
                <p class="txt-secondary">EasyPay Team.</p>
              </div>
              <div class="row flex-column pt-4" style="margin-top: 8%; border-top: 1px solid #000002;">
                <p class="txt-address mb-0">1692 Coastal Highway, Lewes, DE 19958</p>
                <p class="txt-address">©2020 EasyPay Platform LLC.</p>
              </div>
            </div>
          </body>        
      </html>
      `;
      common.sendEmail(email, subject, html);
    }    

    const payload = await userModel.getCustomerRequest();
    return common.send(res, 200, payload, "Success");
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
  getCustomerRequest,
  replyRequest  
};
