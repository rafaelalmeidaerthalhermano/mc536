var db = require('./db');

var Know = function (params) {
    var self = this;

    this.person = params.person;
    this.colleague = params.colleague;

    this.save = function (cb) {
        db(
            'INSERT INTO `know` SET ?',
            {
                'person'   : self.person,
                'colleague': self.colleague
            },
            function () {
                cb(self);
            }
        );
    };
};

module.exports = Know;