var moment = require('moment');
var phoneNumberToken = require('generate-sms-verification-code');
var common = require('../../config/common');
var jwt = require("jsonwebtoken");
var Promise = require('promise');
var DB = require('../../config/database');
var constants = require('../../config/constants');
var userModel = require('../models/userModel')
var request = require('request')
var braintree = require('braintree')

var twilioClient = require('twilio')(constants.TWILIO_ACCOUNT_SID, constants.TWILIO_AUTH_TOKEN)

async function phone (req, res, next) {
  var params = req.body;
  const { phone, iType } = params;
  
  try {
    const _user = await userModel.findUserByPhone(phone);

    if( iType == 0 ) { // signup
      if( _user ) return common.send(res, 300, '', 'You’re already signed up, please go to sign in.');
    } else { // sign in
      if( !_user ) return common.send(res, 301, '', 'We couldn’t find you, please signup.');
    }
    
  } catch (error) {
    return common.send(res, 400, '', 'Exception error: ' + error);
  }
  
  let code = phoneNumberToken(4);

  twilioClient.messages
    .create({
      body: `Your EasyPay verification code is ${code}`,
      from: constants.FROM_NUMBER,
      to: phone 
    })
    .then(message => {
      var payload = {
        phone,
        code
      }
      return common.send(res, 200, payload, 'success');
    })
    .catch(err => {
      console.log('sms err', err)
      return common.send(res, 400, '', 'Sending SMS failed : ' + err);
    });
}

async function verify (req, res, next) {
  var params = req.body;
  const { phone } = params;
  
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    const _user = await userModel.findUserByPhone(phone);
    if( _user  ) {
      if( _user.email ) {
        let token = jwt.sign({ id: _user.id }, constants.SECURITY_KEY, { expiresIn: 60 * 60 * 24 * 365 })

        let _query = 'UPDATE users SET token = ?, updated_at = ? WHERE phone = ? ';
        let _values = [ token, updated_at, phone.replace(/\s/g, '') ];
        
        let _result = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? true : false);
          })
        })
  
        if (!_result) return common.send(res, 300, '', 'Database error');
  
        return common.send(res, 200, token, 'Success');
      } else {
        return common.send(res, 200, null, 'Success');
      }      

    } else {
      return common.send(res, 200, null, 'Success');
    }

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function addUserInfo (req, res, next) {
  var params = req.body;
  const { phone, zip_code, card, email, firstName, lastName, photo, pinCode } = params;
  
  var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  try {
      let _query = 'INSERT INTO users ( firstName, lastName, email, phone, user_type, zip_code, pin_code, photo, card_number, card_cvc, card_exp_month, card_exp_year, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      let _values = [ firstName, lastName, email, phone.replace(/\s/g, ''), 1, zip_code, pinCode, photo, card.number, card.cvc, card.expMonth, card.expYear, created_at, updated_at];
      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? data.insertId : false);
        })
      })
      if (!_result) return common.send(res, 300, '', 'Database error');
      
      let token = jwt.sign({ id: _result }, constants.SECURITY_KEY, { expiresIn: 60 * 60 * 24 * 365 });
      
      let __query = 'UPDATE users SET token = ? WHERE phone = ? ';
      let __values = [ token, phone.replace(/\s/g, '') ];
      
      let __result = await new Promise(function (resolve, reject) {
        DB.query(__query, __values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        })
      })

      if (!__result) return common.send(res, 300, '', 'Database error');

      /****** sending email */
      if(email){
        var subject = 'Welcome to EasyPay'
        var html = `
          <html>
              <body>
                  <p>Hi ${firstName} ${lastName}</p>
                  <p>Welcome to Easy pay, unlock endless opportunities and experience.</p>
                  <p>Warm Regards,</p>                
                  <p>Easy Pay Team.</p>                
              </body>
          </html>
        `;
        common.sendEmail(email, subject, html);
      }      
      /***** end */
      return common.send(res, 200, token, 'Success');    
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function addUserCardInfo (req, res, next) {
  var params = req.body;
  const { phone, zip_code, card } = params;
  
  var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  try {
      let _query = 'INSERT INTO users (phone, user_type, zip_code, card_number, card_cvc, card_exp_month, card_exp_year, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
      let _values = [phone.replace(/\s/g, ''), 1, zip_code, card.number, card.cvc, card.expMonth, card.expYear, created_at, updated_at];
      let _result = await new Promise(function (resolve, reject) {
        DB.query(_query, _values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? data.insertId : false);
        })
      })
      if (!_result) return common.send(res, 300, '', 'Database error');
      
      let token = jwt.sign({ id: _result }, constants.SECURITY_KEY, { expiresIn: 60 * 60 * 24 * 365 });
      
      let __query = 'UPDATE users SET token = ? WHERE phone = ? ';
      let __values = [ token, phone.replace(/\s/g, '') ];
      
      let __result = await new Promise(function (resolve, reject) {
        DB.query(__query, __values, function (err, data) {
          if (err) reject(err);
          else resolve(data.affectedRows > 0 ? true : false);
        })
      })

      if (!__result) return common.send(res, 300, '', 'Database error');

      return common.send(res, 200, token, 'Success');    
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function getInfo (req, res, next) {
  var user_id = res.locals.user_id;
  try {
    const _user = await userModel.findUserById(user_id);
    if(!_user) return common.send(res, 300, '', 'User not found');
    return common.send(res, 200, _user, 'Success');
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function setRate (req, res, next) {
  var user_id = res.locals.user_id;
  var params = req.body;
  const { rate } = params;
  
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    let _query = 'UPDATE users SET rate = ?,  updated_at = ? WHERE id = ? ';
    let _values = [ rate, updated_at, user_id ];
    
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })
    
    if (!_result) return common.send(res, 300, '', 'Database error');

    const _user = await userModel.findUserById(user_id);
    if(!_user) return common.send(res, 300, '', 'User not found');
    return common.send(res, 200, _user, 'Success');
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function updateCard (req, res, next) {
  var user_id = res.locals.user_id;
  var params = req.body;
  const { email, zip_code, card } = params;
  
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    
    const _user = await userModel.findUserById(user_id);
    if(!_user) return common.send(res, 300, '', 'User not found');

    let _query = 'UPDATE users SET email = ?, zip_code = ?, card_number = ?, card_cvc = ?, card_exp_month = ?, card_exp_year = ?,  updated_at = ? WHERE id = ? ';
    let _values = [ email, zip_code, card.number, card.cvc, card.expMonth, card.expYear, updated_at, user_id ];
    
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })

    if (!_result) return common.send(res, 300, '', 'Database error');
    
    const _user_ = await userModel.findUserById(user_id);
    if(!_user_) return common.send(res, 300, '', 'User not found');

    return common.send(res, 200, _user_, 'Success');
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function recoveryInformation (req, res, next) {
  var user_id = res.locals.user_id;
  var params = req.body;
  const { email, pin_code } = params;
  
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    
    const _user = await userModel.findUserById(user_id);
    if(!_user) return common.send(res, 300, '', 'User not found');

    let _query = 'UPDATE users SET email = ?, pin_code = ?,  updated_at = ? WHERE id = ? ';
    let _values = [ email, pin_code, updated_at, user_id ];
    
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })

    if (!_result) return common.send(res, 300, '', 'Database error');
    
    const _user_ = await userModel.findUserById(user_id);
    if(!_user_) return common.send(res, 300, '', 'User not found');

    return common.send(res, 200, _user_, 'Success');
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function updateUserInfo (req, res, next) {
  var user_id = res.locals.user_id;
  var params = req.body;
  const { firstName, lastName, photo, requestPin } = params;
  
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    
    const _user = await userModel.findUserById(user_id);
    if(!_user) return common.send(res, 300, '', 'User not found');

    let _query = 'UPDATE users SET firstName = ?, lastName = ?, photo= ?, requestPin = ?,  updated_at = ? WHERE id = ? ';
    let _values = [ firstName, lastName, photo, requestPin, updated_at, user_id ];
    
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })

    if (!_result) return common.send(res, 300, '', 'Database error');
    
    const _user_ = await userModel.findUserById(user_id);
    if(!_user_) return common.send(res, 300, '', 'User not found');

    return common.send(res, 200, _user_, 'Success');
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function changePhone (req, res, next) {
  var params = req.body;
  const { old_phone, new_phone, pin_code, email } = params;
  
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  try {
    const _user = await userModel.findUserByPhone(old_phone);
    if(!_user) return common.send(res, 300, '', "Old number doesn't exist.");
    
    const __user = await userModel.findUserByPhone(new_phone);
    if(__user) return common.send(res, 300, '', "New number already exists.");

    if(_user.email == '' || _user.pin_code == '' ) return common.send(res, 300, '', "You are not verified yet.");
    if(_user.email != email) return common.send(res, 300, '', "Incorrect Email");
    if(_user.pin_code != pin_code) return common.send(res, 300, '', "Incorrect PIN code");

    let _query = 'UPDATE users SET phone = ?,  updated_at = ? WHERE phone = ? ';
    let _values = [ new_phone, updated_at, old_phone ];
    
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })

    if (!_result) return common.send(res, 300, '', 'Database error');

    /****** sending email */
    if(email){
      var subject = 'Account Recovery'
      var html = `
        <html>
          <body>
            <p>Hi ${_user.firstName} ${_user.lastName}</p>
            <p>Your phone number has been updated on the Easy Pay platform.</p>                
            <p>While this is rare, If this change wasn’t made by you. PLEASE contact support@easypayplatform.io IMMEDIATELY!!</p>                
            <p>Please disregard if you made this change to your account. We are just looking ou!.</p>
            <p>Warm Regards,</p>                
            <p>Easy Pay Team.</p>                
          </body>
        </html>
      `;
      common.sendEmail(email, subject, html);
    }      
    /***** end */

    return common.send(res, 200, true, 'Success');      
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function blockPush (req, res, next) {
  var user_id = res.locals.user_id;
  var params = req.body;
  const { employee_id } = params;
  
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  try {
    const _user = await userModel.findUserById(user_id);
    if(!_user) return common.send(res, 300, '', "User doesn't exist.");
    
    let push_block = _user['allow_notification'];
    let arr_push_block = push_block ? push_block.toString().split(',') : [];
    let index = arr_push_block.indexOf(employee_id.toString());
    if( index === -1){
      arr_push_block.push(employee_id);
    } else {
      arr_push_block.splice( index, 1 );
    }
    
    let _query = 'UPDATE users SET allow_notification = ?,  updated_at = ? WHERE id = ? ';
    let _values = [ arr_push_block.join(), updated_at, user_id ];
    
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })

    if (!_result) return common.send(res, 300, '', 'Database error');

    const _user_ = await userModel.findUserById(user_id);
    if(!_user_) return common.send(res, 300, '', 'User not found');

    return common.send(res, 200, _user_, 'Success');      
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}

async function addOneUser (req, res, next) {
  var params = req.body;
  const { email, zip_code, card } = params;
  
  var created_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');

  try {
    const _user = await userModel.findUserByEmail(email);
    
    if( card === null ) { //paypal
      
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

      request.post({
        uri: constants.PP_URL,
        headers: {
            "Accept": "application/json",
            "Accept-Language": "en_US",
            "content-type": "application/x-www-form-urlencoded"
        },
        auth: {
        'user': constants.PP_CLIENT_ID,
        'pass': constants.PP_CLIENT_SECRET
        },
        form: {
          "grant_type": "client_credentials"
        }
      }, function(error, response, body) {
        var pp = JSON.parse(body)
        var _access_token = pp.access_token;
        console.log(_access_token)
        var gateway = braintree.connect({
          accessToken: _access_token
        });
        console.log(gateway)
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
      })
    
    } else { // card

      if(_user) {
      
        let _query = 'UPDATE users SET zip_code = ?, card_number = ?, card_cvc = ?, card_exp_month = ?, card_exp_year = ?,  updated_at = ? WHERE email = ? ';
        let _values = [ zip_code, card.number, card.cvc, card.expMonth, card.expYear, updated_at, email ];
        
        let _result = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? true : false);
          })
        })
    
        if (!_result) return common.send(res, 300, '', 'Database error');
        
        return common.send(res, 200, _user.id, 'Success');
  
      } else {
        let _query = 'INSERT INTO users ( email, zip_code, card_number, card_cvc, card_exp_month, card_exp_year, user_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        let _values = [ email, zip_code, card.number, card.cvc, card.expMonth, card.expYear, 0, created_at, updated_at];
        
        let user_id = await new Promise(function (resolve, reject) {
          DB.query(_query, _values, function (err, data) {
            if (err) reject(err);
            else resolve(data.affectedRows > 0 ? data.insertId : false);
          })
        })
  
        if (!user_id) return common.send(res, 300, '', 'Database error');
        
        return common.send(res, 200, user_id, 'Success');
      }
    }   

  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}


async function getOne (req, res, next) {
  var params = req.body;
  const { user_id } = params;
  try {
    const _user = await userModel.findUserById(user_id);
    if(!_user) return common.send(res, 300, '', 'User not found');
    return common.send(res, 200, _user, 'Success');
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
  }
}


async function updateToken (req, res, next) {
  var user_id = res.locals.user_id;
  var params = req.body;
  const { token } = params;
  var updated_at = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
  try {
    const _user = await userModel.findUserById(user_id);
    if(!_user) return common.send(res, 300, '', "User doesn't exist.");

    let _query = 'UPDATE users SET push_token = ?,  updated_at = ? WHERE id = ? ';
    let _values = [ token, updated_at, user_id ];
    
    let _result = await new Promise(function (resolve, reject) {
      DB.query(_query, _values, function (err, data) {
        if (err) reject(err);
        else resolve(data.affectedRows > 0 ? true : false);
      })
    })

    if (!_result) return common.send(res, 300, '', 'Database error');

    return common.send(res, 200, true, 'Success');      
  } catch (err) {
    return common.send(res, 400, '', 'Exception error: ' + err);
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
  // one time payment
  addOneUser,
  getOne
}