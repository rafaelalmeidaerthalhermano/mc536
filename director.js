var db = require('./db');

var Director = function (params) {
    var self = this;

    this.name = params.name;

    this.save = function (cb) {
        db(
            'INSERT INTO `director` SET ?',
            {
                'name' : self.name
            },
            function () {
                if (cb) {
                    cb(self);
                }
            }
        );
    };
};

module.exports = Director;