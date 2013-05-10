var db = require('./db');

var Act = function (params) {
    var self = this;

    this.actor = params.director;
    this.movie = params.movie;

    this.save = function (cb) {
        db(
            'INSERT INTO `act` SET ?',
            {
                'actor'    : self.actor,
                'movie'    : self.movie
            },
            function () {
                cb(self);
            }
        );
    };
};

module.exports = Act;