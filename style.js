var db = require('./db');

var Style = function (params) {
    var self = this;

    this.category = params.category;
    this.culturalAct = params.culturalAct;

    this.save = function (cb) {
        db(
            'INSERT INTO `style` SET ?',
            {
                'category'    : this.category,
                'cultural_act' : this.culturalAct
            },
            function () {
                cb(self);
            }
        );
    };
};

module.exports = Style;