var db = require('./db');

var Band = function (params) {
    var self = this;

    this.name = params.name;
    this.locations = params.locations;
    this.relateds = params.relateds;
    this.musicians = params.musicians;
    this.categories = params.categories;

    this.save = function (cb) {
        var culturalActCreated = false,
            locationsCreated = false,
            relatedsCreated = false,
            musiciansCreated = false,
            categoriesCreated = false;

        self.createLocations(function () {
            locationsCreated = true;
            if (locationsCreated && relatedsCreated && musiciansCreated && categoriesCreated && culturalActCreated) {
                self.createBand(cb);
            }
        });
        self.createRelateds(function () {
            relatedsCreated = true;
            if (locationsCreated && relatedsCreated && musiciansCreated && categoriesCreated && culturalActCreated) {
                self.createBand(cb);
            }
        });
        self.createMusicians(function () {
            musiciansCreated = true;
            if (locationsCreated && relatedsCreated && musiciansCreated && categoriesCreated && culturalActCreated) {
                self.createBand(cb);
            }
        });
        self.createCategories(function () {
            categoriesCreated = true;
            if (locationsCreated && relatedsCreated && musiciansCreated && categoriesCreated && culturalActCreated) {
                self.createBand(cb);
            }
        });
        self.createCulturalAct(function () {
            culturalActCreated = true;
            if (locationsCreated && relatedsCreated && musiciansCreated && categoriesCreated && culturalActCreated) {
                self.createBand(cb);
            }
        });
    };

    this.createBand = function (cb) {
        db(
            'INSERT INTO `band` SET ?',
            {
                'name'      : this.name
            },
            function () {
                cb(self);
            }
        );
    };

    this.createCulturalAct = function (cb) {
        db(
            'INSERT INTO `cultural_act` SET ?',
            {
                'name'     : self.name,
            },
            function () {
                cb({name : self.name});
            }
        );
    };

    this.createLocation = function (location, cb) {
        location.save(function () {
            var occur = new require('./occur')({
                band        : self.name
                location    : location.name
            });
            occur.save(function () {
                cb(location);
            });
        });
    };

    this.createLocations = function (cb) {
        var handled = 0;

        for (var i in self.locations) {
            self.createLocation(self.locations[i], function () {
                handled++;
                if (handled >= self.locations.length) {
                    cb(self.locations);
                }
            });
        }
    };

    this.createRelated = function (band, cb) {
        band.save(function () {
            var related = new require('./related')({
                band        : self.name
                related     : band.name
            });
            related.save(function () {
                cb(band);
            });
        });
    };

    this.createRelateds = function (cb) {
        var handled = 0;

        for (var i in self.relateds) {
            self.createRelated(self.relateds[i], function () {
                handled++;
                if (handled >= self.relateds.length) {
                    cb(self.relateds);
                }
            });
        }
    };

    this.createCategory = function (category, cb) {
        category.save(function () {
            var style = new require('./style')({
                category    : category.name
                culturalAct : self.name
            });
            style.save(function () {
                cb(category);
            });
        });
    };

    this.createCategories = function (cb) {
        var handled = 0;

        for (var i in self.categories) {
            self.createCategory(self.categories[i], function () {
                handled++;
                if (handled >= self.categories.length) {
                    cb(self.categories);
                }
            });
        }
    };

    this.createMusician = function (musician, cb) {
        musician.save(function () {
            var participate = new require('./participate')({
                musician    : musician.name
                band        : self.name
            });
            participate.save(function () {
                cb(musician);
            });
        });
    };

    this.createMusicians = function (cb) {
        var handled = 0;

        for (var i in self.musicians) {
            self.createMusician(self.musicians[i], function () {
                handled++;
                if (handled >= self.musicians.length) {
                    cb(self.musicians);
                }
            });
        }
    };
};

Band.find = function (name, cb) {
    //TODO implementar as chamadas pro music brainz e lastfm

    /*
    criar objeto banda para retornar no callback

    var band = new Band ({
        name      : '',
        locations : [
            new new require('./location') ({
                name   : '',
                type   : '',
                parent : ''
            })
            ...
        ],
        musicians : [
            new new require('./musician') ({
                name   : ''
            })
            ...
        ],
        categories : [
            new new require('./category') ({
                name   : ''
            })
            ...
        ],
        relateds : [
            new new require('./band') (...)
            ...
        ]
    });

    cb(band)
    */
};

module.exports = Band;