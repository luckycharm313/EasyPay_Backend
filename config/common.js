var FCM = require("fcm-node");
var nodemailer = require("nodemailer");
var constants = require("./constants");
var fcm = new FCM(constants.FCM_KEY);

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "easypayplatform@gmail.com",
    pass: "Adekoyakolade1",
  },
});

exports.sendEmail = (to, subject, html) => {
  var mailOptions = {
    from: "noreply@easypayplatform.io",
    replyTo: "noreply@easypayplatform.io",
    to,
    subject,
    html,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
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
