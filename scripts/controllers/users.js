var moment = require('moment');
var common = require('../../config/common');
var jwt = require("jsonwebtoken");
var passwordHash = require('password-hash');
var Promise = require('promise');
var DB = require('../../config/database');
var constants = require('../../config/constants')
var employeeModel = require('../models/employeeModel');

async function aaa (req, res, next) {
  
}

module.exports = {
  aaa,
}