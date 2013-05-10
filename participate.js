var db = require('./db');

var Participate = function (params) {
    var self = this;

    this.musician = params.musician;
    this.band = params.band;

    this.save = function (cb) {
        db(
            'INSERT INTO `participate` SET ?',
            {
                'musician' : this.musician,
                'band' : this.band
            },
            function () {
                if (cb) {
                    cb(self);
                }
            }
        );
    };
};

module.exports = Participate;