var moment = require('moment')
var common = require('../../../config/common')
var jwt = require("jsonwebtoken")
var passwordHash = require('password-hash')
var Promise = require('promise')
var DB = require('../../../config/database')
var constants = require('../../../config/constants')
var userModel = require('../../models/userModel')

async function zzz (req, res, next) {
  
}

module.exports = {
  zzz,
}