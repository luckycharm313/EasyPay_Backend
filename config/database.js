var mysql = require('mysql');
var { DB_HOST, DB_USER, DB_PASS, DB_NAME } = require('./constants');

const dbConfig = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME
}

var _connection = mysql.createConnection(dbConfig);

_connection.connect(function(err) { if (err) throw console.log( 'throw error database:13 => ', err); });

module.exports = _connection;