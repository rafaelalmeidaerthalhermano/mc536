var db = require('./db');

var Country = function (params) {
    var self = this;

    this.name = params.name;

    this.save = function (cb) {
        db(
            'INSERT INTO `country` SET ?',
            {
                'name' : this.name,
            },
            function () {
                cb(self);
            }
        );
    };
};

Country.find = function (name, cb) {
    //TODO implementar as chamadas pro geonames
    if (name) {
        require('./get')(
            "http://api.geonames.org/search?username=augustomorgan&maxRows=1&type=json&q=" + name,
            function (places) {
                places = places.geonames[0];
                if (places) {
                    var country = new Country ({
                            name : places.countryName
                        });
                    if (cb) {
                        cb(country);
                    }
                } else {
                    if (cb) {
                        cb(null);
                    }
                }
            }
        );
    } else {
        if (cb) {
            cb(null);
        }
    }
};

module.exports = Country;