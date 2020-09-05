
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var multer = require('multer');
var constants = require('../config/constants')
var path = require('path');

var app = express();
var routes = require('./routes/index');
var api = require('./routes/api');
var admin = require('./routes/admin');
var dashboard = require('./routes/dashboard');

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function(req, file, cb){
     cb(null, "IMAGE-" + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits:{fileSize: 50 * 1024 * 1024},
}).single("photo");

///////////////////////////////////////
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
// app.use(upload.array());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, token");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Expose-Headers", "Authorization");
  next();
});

app.use('/', routes);
app.use('/api', api);
app.use('/admin', admin);
app.use('/dashboard', dashboard);

app.listen(constants.PORT);

app.get('/', function(req, res) {
  console.log("server running " + constants.PORT);
  res.send("server is running");
});

app.post('/upload', upload, (req, res) => {
  const _url = req.protocol + '://' + req.get('host')
  console.log("Request file ---", req.file);//Here you get file.
  let url =  _url + '/uploads/' + req.file.filename
  return res.send(url).end();
})

