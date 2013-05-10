var db = require('./db');

var Location = function (params) {
    var self = this;

    this.name = params.name;
    this.type = params.type;
    this.parent = params.parent;

    this.save = function (cb) {
        db(
            'INSERT INTO `location` SET ?',
            {
                'name'     : this.name,
                'type'     : this.type,
                'parent'   : this.parent
            },
            function () {
                cb(self);
            }
        );
    };
};

Location.find = function (name, cb) {
    //TODO implementar as chamadas pro geonames

    /*
    criar objeto location para retornar no callback

    var location = new Location ({
        name      : '',
        type      : '',
        parent    : ''
    });

    cb(location)
    */
};

module.exports = Location;