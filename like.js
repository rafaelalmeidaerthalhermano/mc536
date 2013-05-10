var db = require('./db');

var Like = function (params) {
    var self = this;

    this.person = params.person;
    this.culturalAct = params.culturalAct;
    this.rating = params.rating;

    this.save = function (cb) {
        db(
            'INSERT INTO `like` SET ?',
            {
                'person'     : self.person,
                'culturalAct': self.culturalAct,
                'rating'     : self.rating
            },
            function () {
                cb(self);
            }
        );
    };
};

module.exports = Like;