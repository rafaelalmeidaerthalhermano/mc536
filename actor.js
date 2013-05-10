var db = require('./db');

var Actor = function (params) {
    var self = this;

    this.name = params.name;

    this.save = function (cb) {
        db(
            'INSERT INTO `actor` SET ?',
            {
                'name'     : self.name
            },
            function () {
                cb(self);
            }
        );
    };
};

module.exports = Actor;