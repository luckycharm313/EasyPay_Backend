var FCM = require("fcm-node");
var nodemailer = require("nodemailer");
var constants = require("./constants");
var fcm = new FCM(constants.FCM_KEY);
var adminFcm = new FCM(constants.FCM_ADMIN_KEY);

var transporter = nodemailer.createTransport({
  service: "gmail",
  secure: false,//true
  port: 25,
  auth: {
    user: "easypayplatform@gmail.com",
    pass: "Adekoyakolade1",
  },
  tls: {
    rejectUnauthorized: false
  }
});

exports.sendEmail = (to, subject, html) => {
  var mailOptions = {
    from: {
      name: 'Easy Pay Platform',
      address: 'noreply@easypayplatform.io'
    },
    replyTo: "noreply@easypayplatform.io",
    to,
    subject,
    html,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
      return error;
    } else {
      console.log("Email sent: " + info.response);
      return "Email sent: " + info.response;
    }
  });
};

exports.send = (res, code, payload, message) => {
  var response = {
    code,
    payload,
    message,
  };

  return res.send(response);
};

exports.sendMessageThroughFCM = function (
  receiverTokens,
  data,
  callback
) {
  var message = {
    registration_ids: receiverTokens,
    notification: {
      title: data.title,
      body: data.body,
    },
    priority: "high",
    data: {
      data: data,
      notification: {
        title: data.title,
        body: data.body
      }
    },
    content_available: true
  };
  console.log("*** FCM notification *** ", message);
  fcm.send(message, function (err, response) {
    if (err) {
      return callback(err);
    } else return callback(response);
  });
};

exports.sendDataThroughFCM = function (
  receiverToken,
  data,
  callback
) {
  var message = {
    to: receiverToken,
    priority: "high",
    data: {
      data: data,
    },
    content_available: true
  };
  console.log("*** FCM data *** ", message);
  adminFcm.send(message, function (err, response) {
    if (err) {
      return callback(err);
    } else return callback(response);
  });
};

exports.sendDataThroughFCMByType = function (
  receiverTokens,
  data,
  iType,
  callback
) {
  var message = {
    registration_ids: receiverTokens,
    priority: "high",
    data: {
      data: data,
    },
    content_available: true
  };
  console.log("*** FCM data *** ", message);
  if( iType === 0 ) {
    fcm.send(message, function (err, response) {
      if (err) {
        return callback(err);
      } else return callback(response);
    });
  } else {
    adminFcm.send(message, function (err, response) {
      if (err) {
        return callback(err);
      } else return callback(response);
    });
  }
};