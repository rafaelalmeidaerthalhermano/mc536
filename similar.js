var db = require('./db');

var Similar = function (params) {
    var self = this;

    this.band = params.band;
    this.similar = params.similar;

    this.save = function (cb) {
        db(
            'INSERT INTO `similar` SET ?',
            {
                'band' : self.band,
                'similar' : self.similar
            },
            function () {
                cb(self);
            }
        );
    };
};

module.exports = Similar;