var moment = require("moment");
var phoneNumberToken = require("generate-sms-verification-code");
var common = require("../../config/common");
var jwt = require("jsonwebtoken");
var Promise = require("promise");
var DB = require("../../config/database");
var constants = require("../../config/constants");
var userModel = require("../models/userModel");
var request = require("request");
var braintree = require("braintree");

var twilioClient = require("twilio")(
  constants.TWILIO_ACCOUNT_SID,
  constants.TWILIO_AUTH_TOKEN
);

async function phone(req, res, next) {
  var params = req.body;
  const { phone, iType } = params;

  try {
    const _user = await userModel.findUserByPhone(phone);

    if (iType == 0) {
      // signup
      if (_user)
        return common.send(
          res,
          300,
          "",
          "You’re already signed up, please go to sign in."
        );
    } else {
      // sign in
      if (!_user)
        return common.send(
          res,
          301,
          "",
          "We couldn’t find you, please signup."
        );
    }
  } catch (error) {
    return common.send(res, 400, "", "Exception error: " + error);
  }

  let code = phoneNumberToken(4);

  twilioClient.messages
    .create({
      body: `Your EasyPay verification code is ${code}`,
      from: constants.FROM_NUMBER,
      to: phone,
    })
    .then((message) => {
      var payload = {
        phone,
        code,
      };
      return common.send(res, 200, payload, "success");
    })
    .catch((err) => {
      console.log("sms err", err);
      return common.send(res, 400, "", "Sending SMS failed : " + err);
    });
}

async function verify(req, res, next) {
  var params = req.body;
  const { phone, iType } = params;

  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    const _user = await userModel.findUserByPhone(phone);
    if (_user) {
      if (iType === 1) {
        let token = jwt.sign({ id: _user.id }, constants.SECURITY_KEY, {
          expiresIn: 60 * 60 * 24 * 365,
        });

        let _query =
          "UPDATE users SET token = ?, updated_at = ? WHERE phone = ? ";
        let _values = [token, updated_at, phone.replace(/\s/g, "")];

        let _result = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? true : false);
          });
        });

        if (!_result) return common.send(res, 300, "", "Database error");

        return common.send(res, 200, token, "Success");
      } else {
        return common.send(res, 200, null, "Success");
      }
    } else {
      return common.send(res, 200, null, "Success");
    }
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function addUserInfo(req, res, next) {
  var params = req.body;
  const {
    phone,
    zip_code,
    card,
    email,
    firstName,
    lastName,
    photo,
    pinCode,
  } = params;

  var created_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
  try {
    let _query =
      "INSERT INTO users ( firstName, lastName, email, phone, user_type, zip_code, pin_code, photo, card_number, card_cvc, card_exp_month, card_exp_year, card_holder, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    let _values = [
      firstName,
      lastName,
      email,
      phone.replace(/\s/g, ""),
      1,
      zip_code,
      pinCode,
      photo,
      card.number,
      card.cvc,
      card.expMonth,
      card.expYear,
      card.holder,
      created_at,
      updated_at,
    ];
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? data.insertId : false);
      });
    });
    if (!_result) return common.send(res, 300, "", "Database error");

    let token = jwt.sign({ id: _result }, constants.SECURITY_KEY, {
      expiresIn: 60 * 60 * 24 * 365,
    });

    let __query = "UPDATE users SET token = ? WHERE phone = ? ";
    let __values = [token, phone.replace(/\s/g, "")];

    let __result = await new Promise(function (resolve, reject) {
      DB.query(__query, __values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });

    if (!__result) return common.send(res, 300, "", "Database error");

    /****** sending email */
    if (email) {
      var subject = "Welcome To EasyPay";
      var html = `
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
                  <h6 class="txt-primary">Welcome to EasyPay</h6>
                </div>
                <div class="row mt-4 flex-column">
                  <p class="txt-secondary">Hi ${firstName} ${lastName}</p>
                  <p class="txt-secondary">Welcome to EasyPay, unlock endless opportunities and experience(s).</p>
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
    /***** end */
    return common.send(res, 200, token, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function addUserCardInfo(req, res, next) {
  var params = req.body;
  const { phone, zip_code, card } = params;

  var created_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
  try {
    let _query =
      "INSERT INTO users (phone, user_type, zip_code, card_number, card_cvc, card_exp_month, card_exp_year, card_holder, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    let _values = [
      phone.replace(/\s/g, ""),
      1,
      zip_code,
      card.number,
      card.cvc,
      card.expMonth,
      card.expYear,
      card.holder,
      created_at,
      updated_at,
    ];
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? data.insertId : false);
      });
    });
    if (!_result) return common.send(res, 300, "", "Database error");

    let token = jwt.sign({ id: _result }, constants.SECURITY_KEY, {
      expiresIn: 60 * 60 * 24 * 365,
    });

    let __query = "UPDATE users SET token = ? WHERE phone = ? ";
    let __values = [token, phone.replace(/\s/g, "")];

    let __result = await new Promise(function (resolve, reject) {
      DB.query(__query, __values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });

    if (!__result) return common.send(res, 300, "", "Database error");

    return common.send(res, 200, token, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function getInfo(req, res, next) {
  var user_id = res.locals.user_id;
  try {
    const _user = await userModel.findUserById(user_id);
    if (!_user) return common.send(res, 300, "", "User not found");
    return common.send(res, 200, _user, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function setRate(req, res, next) {
  var user_id = res.locals.user_id;
  var params = req.body;
  const { rate } = params;

  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    let _query = "UPDATE users SET rate = ?,  updated_at = ? WHERE id = ? ";
    let _values = [rate, updated_at, user_id];

    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });

    if (!_result) return common.send(res, 300, "", "Database error");

    const _user = await userModel.findUserById(user_id);
    if (!_user) return common.send(res, 300, "", "User not found");
    return common.send(res, 200, _user, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function updateCard(req, res, next) {
  var user_id = res.locals.user_id;
  var params = req.body;
  const { zip_code, card, id, isDefault } = params;

  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    const _user = await userModel.findUserById(user_id);
    if (!_user) return common.send(res, 300, "", "User not found");

    if (isDefault === 0) {
      let _query =
        "UPDATE cards SET zip_code = ?, card_number = ?, card_cvc = ?, card_exp_month = ?, card_exp_year = ?, card_holder = ?,  updated_at = ? WHERE id = ? ";
      let _values = [
        zip_code,
        card.number,
        card.cvc,
        card.expMonth,
        card.expYear,
        card.holder,
        updated_at,
        id,
      ];

      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        });
      });

      if (!_result) return common.send(res, 300, "", "Database error");
    } else {
      let _query =
        "UPDATE users SET zip_code = ?, card_number = ?, card_cvc = ?, card_exp_month = ?, card_exp_year = ?, card_holder = ?,  updated_at = ? WHERE id = ? ";
      let _values = [
        zip_code,
        card.number,
        card.cvc,
        card.expMonth,
        card.expYear,
        card.holder,
        updated_at,
        user_id,
      ];

      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        });
      });

      if (!_result) return common.send(res, 300, "", "Database error");
    }

    let payload = await getCardsByUser(user_id);
    return common.send(res, 200, payload, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function recoveryInformation(req, res, next) {
  var user_id = res.locals.user_id;
  var params = req.body;
  const { email, pin_code } = params;

  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    const _user = await userModel.findUserById(user_id);
    if (!_user) return common.send(res, 300, "", "User not found");

    let _query =
      "UPDATE users SET email = ?, pin_code = ?,  updated_at = ? WHERE id = ? ";
    let _values = [email, pin_code, updated_at, user_id];

    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });

    if (!_result) return common.send(res, 300, "", "Database error");

    const _user_ = await userModel.findUserById(user_id);
    if (!_user_) return common.send(res, 300, "", "User not found");

    /****** sending email */
    if (email) {
      var subject = "Account Verification";
      var html = `
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
                  <h6 class="txt-primary">Account Verification</h6>
                </div>
                <div class="row mt-4 flex-column">
                  <p class="txt-secondary">You’ve successfully verified your EasyPay account. Enjoy your freedom and many more perks.</p>
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
    /***** end */

    return common.send(res, 200, _user_, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function updateUserInfo(req, res, next) {
  var user_id = res.locals.user_id;
  var params = req.body;
  const { firstName, lastName, photo, requestPin } = params;

  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    const _user = await userModel.findUserById(user_id);
    if (!_user) return common.send(res, 300, "", "User not found");

    let _query =
      "UPDATE users SET firstName = ?, lastName = ?, photo= ?, requestPin = ?,  updated_at = ? WHERE id = ? ";
    let _values = [firstName, lastName, photo, requestPin, updated_at, user_id];

    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });

    if (!_result) return common.send(res, 300, "", "Database error");

    const _user_ = await userModel.findUserById(user_id);
    if (!_user_) return common.send(res, 300, "", "User not found");

    return common.send(res, 200, _user_, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function changePhone(req, res, next) {
  var params = req.body;
  const { old_phone, new_phone, pin_code, email } = params;

  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
  try {
    const _user = await userModel.findUserByPhone(old_phone);
    if (!_user) return common.send(res, 300, "", "Old number doesn't exist.");

    const __user = await userModel.findUserByPhone(new_phone);
    if (__user) return common.send(res, 300, "", "New number already exists.");

    if (_user.email == "" || _user.pin_code == "")
      return common.send(res, 300, "", "You are not verified yet.");
    if (_user.email != email)
      return common.send(res, 300, "", "Incorrect Email");
    if (_user.pin_code != pin_code)
      return common.send(res, 300, "", "Incorrect PIN code");

    let _query = "UPDATE users SET phone = ?,  updated_at = ? WHERE phone = ? ";
    let _values = [new_phone, updated_at, old_phone];

    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });

    if (!_result) return common.send(res, 300, "", "Database error");

    const __user__ = await userModel.findUserByPhone(new_phone);
    if (!__user__) return common.send(res, 300, "", "user doesn't exist.");

    /****** sending email */
    if (email) {
      var subject = "Information About Your Account - EasyPay Platform";
      var html = `
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
              <div class="row" style="margin-left: -20px;">
                <img alt="EasyPay" class="mt-5" style="margin-right: -10;"
                  src="https://easypay.s3.us-east-2.amazonaws.com/app_logo.png" width="120" height="41.5" />
              </div>
              <div class="row mt-3">
                <h6 class="txt-primary">Welcome to EasyPay</h6>
              </div>
              <div class="row mt-4 flex-column">
                <p class="txt-secondary">Hi ${_user.firstName} ${_user.lastName}</p>
                <p class="txt-secondary">Your phone number has been updated on the EasyPay Platform.</p>
                <p class="txt-secondary">While this is rare, IF this change wasn’t made by you PLEASE contact support@easypayplatform.io IMMEDIATELY!!</p>
                <p class="txt-secondary">Please disregard this message if you made this change to your account. We are just looking out!</p>
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
    /***** end */

    return common.send(res, 200, __user__, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function blockPush(req, res, next) {
  var user_id = res.locals.user_id;
  var params = req.body;
  const { employee_id } = params;

  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
  try {
    const _user = await userModel.findUserById(user_id);
    if (!_user) return common.send(res, 300, "", "User doesn't exist.");

    let push_block = _user["allow_notification"];
    let arr_push_block = push_block ? push_block.toString().split(",") : [];
    let index = arr_push_block.indexOf(employee_id.toString());
    if (index === -1) {
      arr_push_block.push(employee_id);
    } else {
      arr_push_block.splice(index, 1);
    }

    let _query =
      "UPDATE users SET allow_notification = ?,  updated_at = ? WHERE id = ? ";
    let _values = [arr_push_block.join(), updated_at, user_id];

    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });

    if (!_result) return common.send(res, 300, "", "Database error");

    const _user_ = await userModel.findUserById(user_id);
    if (!_user_) return common.send(res, 300, "", "User not found");

    return common.send(res, 200, _user_, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function addOneUser(req, res, next) {
  var params = req.body;
  const { email, zip_code, card } = params;

  var created_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    const _user = await userModel.findUserByEmail(email);

    if (card === null) {
      //paypal

      // var _pp = await axios.request({
      //   url: constants.PP_URL,
      //   method: "post",
      //   headers: {
      //     'content-type': 'application/x-www-form-urlencoded'
      //   },
      //   auth: {
      //     username: constants.PP_CLIENT_ID,
      //     password: constants.PP_CLIENT_SECRET
      //   },
      //   data: {
      //     "grant_type": "client_credentials"
      //   }
      // })

      request.post(
        {
          uri: constants.PP_URL,
          headers: {
            Accept: "application/json",
            "Accept-Language": "en_US",
            "content-type": "application/x-www-form-urlencoded",
          },
          auth: {
            user: constants.PP_CLIENT_ID,
            pass: constants.PP_CLIENT_SECRET,
          },
          form: {
            grant_type: "client_credentials",
          },
        },
        function (error, response, body) {
          var pp = JSON.parse(body);
          var _access_token = pp.access_token;
          console.log(_access_token);
          var gateway = braintree.connect({
            accessToken: _access_token,
          });
          console.log(gateway);
          // gateway.clientToken.generate({}, async function (err, response) {
          //   console.log(response)
          //   if(!err) {
          //     var access_token = response.clientToken
          //     if(_user) {

          //       let _query = 'UPDATE users SET zip_code = ?, paypal = ?,  updated_at = ? WHERE email = ? ';
          //       let _values = [ zip_code, access_token, updated_at, email ];

          //       let _result = await new Promise(function (resolve, reject) {
          //         DB.query(_query, _values, function (err, data) {
          //           if (err) reject(err);
          //           else resolve(data.affectedRows > 0 ? true : false);
          //         })
          //       })

          //       if (!_result) return common.send(res, 300, '', 'Database error');

          //       return common.send(res, 200, _user.id, 'Success');

          //     } else {
          //       let _query = 'INSERT INTO users ( email, zip_code, paypal, user_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)';
          //       let _values = [ email, zip_code, access_token, 0, created_at, updated_at];

          //       let user_id = await new Promise(function (resolve, reject) {
          //         DB.query(_query, _values, function (err, data) {
          //           if (err) reject(err);
          //           else resolve(data.affectedRows > 0 ? data.insertId : false);
          //         })
          //       })

          //       if (!user_id) return common.send(res, 300, '', 'Database error');

          //       return common.send(res, 200, user_id, 'Success');
          //     }
          //   }
          // });
        }
      );
    } else {
      // card

      if (_user) {
        let _query =
          "UPDATE users SET zip_code = ?, card_number = ?, card_cvc = ?, card_exp_month = ?, card_exp_year = ?, card_holder =?,  updated_at = ? WHERE email = ? ";
        let _values = [
          zip_code,
          card.number,
          card.cvc,
          card.expMonth,
          card.expYear,
          card.holder,
          updated_at,
          email,
        ];

        let _result = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? true : false);
          });
        });

        if (!_result) return common.send(res, 300, "", "Database error");

        return common.send(res, 200, _user.id, "Success");
      } else {
        let _query =
          "INSERT INTO users ( email, zip_code, card_number, card_cvc, card_exp_month, card_exp_year, card_holder, user_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        let _values = [
          email,
          zip_code,
          card.number,
          card.cvc,
          card.expMonth,
          card.expYear,
          card.holder,
          0,
          created_at,
          updated_at,
        ];

        let user_id = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? data.insertId : false);
          });
        });

        if (!user_id) return common.send(res, 300, "", "Database error");

        return common.send(res, 200, user_id, "Success");
      }
    }
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function getOne(req, res, next) {
  var params = req.body;
  const { user_id } = params;
  try {
    const _user = await userModel.findUserById(user_id);
    if (!_user) return common.send(res, 300, "", "User not found");
    return common.send(res, 200, _user, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function updateToken(req, res, next) {
  var user_id = res.locals.user_id;
  var params = req.body;
  const { token } = params;
  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
  try {
    const _user = await userModel.findUserById(user_id);
    if (!_user) return common.send(res, 300, "", "User doesn't exist.");

    let _query =
      "UPDATE users SET push_token = ?,  updated_at = ? WHERE id = ? ";
    let _values = [token, updated_at, user_id];

    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });

    if (!_result) return common.send(res, 300, "", "Database error");

    return common.send(res, 200, true, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function addMoreCard(req, res, next) {
  var user_id = res.locals.user_id;
  const { zip_code, card, iType } = req.body;

  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    const _user = await userModel.findUserById(user_id);
    if (!_user) return common.send(res, 300, "", "User doesn't exist.");

    if (iType === 0) {
      let _query =
        "UPDATE users SET zip_code = ?, card_number = ?, card_cvc = ?, card_exp_month = ?, card_exp_year = ?, card_holder = ?,  updated_at = ? WHERE id = ? ";
      let _values = [
        zip_code,
        card.number,
        card.cvc,
        card.expMonth,
        card.expYear,
        card.holder,
        updated_at,
        user_id,
      ];

      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        });
      });

      if (!_result) return common.send(res, 300, "", "Database error");

      if (_user.card_number) {
        let __query =
          "INSERT INTO cards (user_id, zip_code, card_number, card_cvc, card_exp_month, card_exp_year, card_holder, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        let __values = [
          user_id,
          _user.zip_code,
          _user.card_number,
          _user.card_cvc,
          _user.card_exp_month,
          _user.card_exp_year,
          _user.card_holder,
          updated_at,
          updated_at,
        ];
        let __result = await new Promise(function (resolve, reject) {
          DB.query(__query, __values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? data.insertId : false);
          });
        });
        if (!__result) return common.send(res, 300, "", "Database error");
      }
      let payload = await getCardsByUser(user_id);
      return common.send(res, 200, payload, "Success");
    } else {
      let __query =
        "INSERT INTO cards (user_id, zip_code, card_number, card_cvc, card_exp_month, card_exp_year, card_holder, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      let __values = [
        user_id,
        zip_code,
        card.number,
        card.cvc,
        card.expMonth,
        card.expYear,
        card.holder,
        updated_at,
        updated_at,
      ];
      let __result = await new Promise(function (resolve, reject) {
        DB.query(__query, __values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? data.insertId : false);
        });
      });
      if (!__result) return common.send(res, 300, "", "Database error");
      let payload = await getCardsByUser(user_id);
      return common.send(res, 200, payload, "Success");
    }
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function removeCard(req, res, next) {
  var user_id = res.locals.user_id;
  const { card_id, iType } = req.body;
  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    const _user = await userModel.findUserById(user_id);
    if (!_user) return common.send(res, 300, "", "User doesn't exist.");

    const _cardList = await userModel.getCardsByUserID(user_id);
    console.log(_cardList);
    console.log(_cardList.length);
    if (iType === 0) {
      if (_cardList.length === 0) {
        let _query =
          "UPDATE users SET zip_code = ?, card_number = ?, card_cvc = ?, card_exp_month = ?, card_exp_year = ?, card_holder = ?,  updated_at = ? WHERE id = ? ";
        let _values = ["", "", "", "", "", "", updated_at, user_id];

        let _result = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? true : false);
          });
        });

        if (!_result) return common.send(res, 300, "", "Database error");
      } else {
        let _query =
          "UPDATE users SET zip_code = ?, card_number = ?, card_cvc = ?, card_exp_month = ?, card_exp_year = ?, card_holder = ?,  updated_at = ? WHERE id = ? ";
        let _values = [
          _cardList[0].zip_code,
          _cardList[0].card_number,
          _cardList[0].card_cvc,
          _cardList[0].card_exp_month,
          _cardList[0].card_exp_year,
          _cardList[0].card_holder,
          updated_at,
          user_id,
        ];

        let _result = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? true : false);
          });
        });

        if (!_result) return common.send(res, 300, "", "Database error");

        const __del_card = await userModel.removeCardsByID(_cardList[0].id);
        if (!__del_card) return common.send(res, 300, "", "Database error");
      }

      let payload = await getCardsByUser(user_id);
      return common.send(res, 200, payload, "Success");
    } else {
      const __del_card = await userModel.removeCardsByID(card_id);
      if (!__del_card) return common.send(res, 300, "", "Database error");

      let payload = await getCardsByUser(user_id);
      return common.send(res, 200, payload, "Success");
    }
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function swipeCard(req, res, next) {
  var user_id = res.locals.user_id;
  const { info } = req.body;

  var updated_at = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    const _user = await userModel.findUserById(user_id);
    if (!_user) return common.send(res, 300, "", "User doesn't exist.");

    let _query =
      "UPDATE users SET zip_code = ?, card_number = ?, card_cvc = ?, card_exp_month = ?, card_exp_year = ?, card_holder = ?,  updated_at = ? WHERE id = ? ";
    let _values = [
      info.zip_code,
      info.card_number,
      info.card_cvc,
      info.card_exp_month,
      info.card_exp_year,
      info.card_holder,
      updated_at,
      user_id,
    ];

    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      });
    });

    if (!_result) return common.send(res, 300, "", "Database error");

    if (_user.card_number) {
      let __query =
        "UPDATE cards SET zip_code = ?, card_number = ?, card_cvc = ?, card_exp_month = ?, card_exp_year = ?, card_holder = ?,  updated_at = ? WHERE id = ?";
      let __values = [
        _user.zip_code,
        _user.card_number,
        _user.card_cvc,
        _user.card_exp_month,
        _user.card_exp_year,
        _user.card_holder,
        updated_at,
        info.id,
      ];
      let __result = await new Promise(function (resolve, reject) {
        DB.query(__query, __values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        });
      });
      if (!__result) return common.send(res, 300, "", "Database error");
    }

    let payload = await getCardsByUser(user_id);
    return common.send(res, 200, payload, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function getCardList(req, res, next) {
  var user_id = res.locals.user_id;

  try {
    const _user = await userModel.findUserById(user_id);
    if (!_user) return common.send(res, 300, "", "User doesn't exist.");

    let payload = await getCardsByUser(user_id);
    return common.send(res, 200, payload, "Success");
  } catch (err) {
    return common.send(res, 400, "", "Exception error: " + err);
  }
}

async function getCardsByUser(user_id) {
  try {
    const _user = await userModel.findUserById(user_id);

    let _cardList = await userModel.getCardsByUserID(user_id);
    let payload = [];
    if (_user.card_number) {
      payload.push({
        zip_code: _user.zip_code,
        card_number: _user.card_number,
        card_cvc: _user.card_cvc,
        card_exp_month: _user.card_exp_month,
        card_exp_year: _user.card_exp_year,
        card_holder: _user.card_holder,
        user_id: _user.id,
        isDefault: 1,
        id: 0,
      });
    }
    _cardList.length > 0 &&
      _cardList.forEach((e) => {
        payload.push({
          zip_code: e.zip_code,
          card_number: e.card_number,
          card_cvc: e.card_cvc,
          card_exp_month: e.card_exp_month,
          card_exp_year: e.card_exp_year,
          card_holder: e.card_holder,
          user_id: e.user_id,
          isDefault: 0,
          id: e.id,
        });
      });

    return payload;
  } catch (error) {
    return [];
  }
}

module.exports = {
  phone,
  verify,
  addUserInfo,
  addUserCardInfo,
  recoveryInformation,
  updateUserInfo,
  getInfo,
  setRate,
  updateCard,
  changePhone,
  blockPush,
  updateToken,
  addMoreCard,
  removeCard,
  swipeCard,
  getCardList,
  // one time payment
  addOneUser,
  getOne,
};
