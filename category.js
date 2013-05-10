var db = require('./db');

var Category = function (params) {
    var self = this;

    this.name = params.name;

    this.save = function (cb) {
        db(
            'INSERT INTO `category` SET ?',
            {
                'name'     : self.name
            },
            function () {
                cb(self);
            }
        );
    };
};

module.exports = Category;