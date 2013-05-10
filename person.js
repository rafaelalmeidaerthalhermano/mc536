var db = require('./db');

var Person = function (params) {
    var self = this;

    this.uri = params.uri;
    this.name = params.name;
    this.hometown = params.hometown;

    this.save = function (cb) {
        this.createHometown(function (location) {
            self.hometown = location.name;
            db(
                'INSERT INTO `person` SET ?',
                {
                    'uri'      : this.uri,
                    'name'     : this.name,
                    'hometown' : this.hometown
                },
                function () {
                    cb(self);
                }
            );
        });
    };

    this.createHometown = function (cb) {
        require('./location').find(this.hometown, function (location) {
            location.save(function () {
                cb(location);
            });
        });
    }
};

module.exports = Person;