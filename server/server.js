
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var multer = require('multer');
var upload = multer();
var constants = require('../config/constants')

var app = express();
var routes = require('./routes/index');
var api = require('./routes/api');
var admin = require('./routes/admin');

///////////////////////////////////////

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(upload.array());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Expose-Headers", "Authorization");
  next();
});


app.use('/', routes);
app.use('/api', api);
app.use('/admin', admin);

app.listen(constants.PORT);

app.get('/', function(req, res) {
  console.log("server running " + constants.PORT);
  res.send("server is running");
});