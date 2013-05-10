var db = require('./db');

var Person = function (params) {
    var self = this;

    this.uri = params.uri;
    this.name = params.name;
    this.hometown = params.hometown;

    this.save = function (cb) {
        self.createHometown(function (city) {
            if(city) {
                self.hometown = city.name;
            } else {
                self.hometown = null;
            }
            db(
                'INSERT INTO `person` SET ?',
                {
                    'uri' : self.uri,
                    'name' : self.name,
                    'hometown' : self.hometown
                },
                function () {
                    if (cb) {
                        cb(self);
                    }
                }
            );
        });
    };

    this.createHometown = function (cb) {
        require('./city').find(self.hometown, function (city) {
            if(city) {
                city.save(function () {
                    if (cb) {
                        cb(city);
                    }
                });
            } else {
                if (cb) {
                    cb(city);
                }
            }
        });
    }
};

module.exports = Person;