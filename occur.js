var db = require('./db');

var Occur = function (params) {
    var self = this;

    this.band = params.band;
    this.location = params.location;

    this.save = function (cb) {
        db(
            'INSERT INTO `occur` SET ?',
            {
                'band'        : this.band,
                'location'    : this.location
            },
            function () {
                cb(self);
            }
        );
    };
};

module.exports = Occur;