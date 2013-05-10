var db = require('./db');

var Similar = function (params) {
    var self = this;

    this.band = params.band;
    this.similar = params.similar;

    this.save = function (cb) {
        db(
            'INSERT INTO `similar` SET ?',
            {
                'band'    : this.band,
                'similar' : this.similar
            },
            function () {
                cb(self);
            }
        );
    };
};

module.exports = Similar;