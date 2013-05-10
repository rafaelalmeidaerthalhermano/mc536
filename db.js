
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Aim3eif7',
  database : 'social',
});

module.exports = function (query, data, cb) {
	connection.query(query, data, cb);	
}