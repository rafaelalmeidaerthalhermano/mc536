var http = require('http');

var Get = function (url , cb) {
    http.get(url, function(httpResponse) {
        var response = '';
        httpResponse.on('data', function (data) {
            response += data;
        });
        httpResponse.on('end', function () {
            cb(JSON.parse(response.toString()))
        });
    });
};

module.exports = Get;
