var db = require('./db');

var Direct = function (params) {
    var self = this;

    this.director = params.director;
    this.movie = params.movie;

    this.save = function (cb) {
        db(
            'INSERT INTO `direct` SET ?',
            {
                'director' : self.director,
                'movie' : self.movie
            },
            function () {
                if (cb) {
                    cb(self);
                }
            }
        );
    };
};

module.exports = Direct;