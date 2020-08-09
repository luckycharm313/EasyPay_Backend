var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'easypayplatform@gmail.com',
    pass: 'Adekoyakolade1'
  }
});

exports.sendEmail = (res, to, subject, html) => {
  var mailOptions = {
    from: 'easypayplatform@gmail.com',
    to,
    subject,
    html
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      return (error);
    } else {
      console.log('Email sent: ' + info.response);
      return ('Email sent: ' + info.response);
    }
  });
}


exports.send = (res, code, payload, message) => {
  var response = {
      code,
      payload,
      message
  };

  return res.send(response);
}