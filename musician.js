var db = require('./db');

var Musician = function (params) {
    var self = this;

    this.name = params.name;

    this.save = function (cb) {
        db(
            'INSERT INTO `musician` SET ?',
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

module.exports = Musician;