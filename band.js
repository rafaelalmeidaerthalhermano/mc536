var db = require('./db');

var Band = function (params) {
    var self = this;

    this.name = params.name;
    this.country = params.country;
    this.similars = params.similars;
    this.musicians = params.musicians;
    this.categories = params.categories;

    this.save = function (cb) {
        var similarsCreated = true,
            musiciansCreated = false,
            categoriesCreated = false;

        self.createCulturalAct(function () {
                self.createCountry(function (country) {
                    if(country)
                        self.country = country.name;
                    else self.country = null;

                    self.createBand(function () {
                        self.createSimilars(function () {
                            similarsCreated = true;
                            if (similarsCreated && musiciansCreated && categoriesCreated) {
                                cb();
                            }
                        });
                        self.createMusicians(function (err) {
                            musiciansCreated = true;
                            if (similarsCreated && musiciansCreated && categoriesCreated) {
                                cb();
                            }
                        });
                        self.createCategories(function (err) {
                            categoriesCreated = true;
                            if (similarsCreated && musiciansCreated && categoriesCreated) {
                                cb();
                            }
                        });
                    });
                });
        });
    };

    this.createBand = function (cb) {
        db(
            'INSERT INTO `band` SET ?',
            {
                'name'      : self.name,
                'location'  : self.country
            },
            function () {
                cb(self);
            }
        );
    };

    this.createCulturalAct = function (cb) {
        db(
            'INSERT INTO `culturalAct` SET ?',
            {
                'name'     : self.name,
            },
            function () {
                cb({name : self.name});
            }
        );
    };

    this.createCountry = function (cb) {
        if(self.country){
            require('./country').find(self.country, function (country) {
                if(country)
                    country.save(function () {
                        cb(country);
                    });
                else cb(null);
            });
        } else cb(null);
    };

    this.createSimilar = function (band, cb) {
        band.save(function () {
            var Similar = require('./similar'),
                similar = new Similar ({
                band        : self.name,
                similar     : band.name
            });
            similar.save(function () {
                cb(band);
            });
        });
    };

    this.createSimilars = function (cb) {
        if(self.similars && self.similars.length > 0) {
            var handled = 0;

            for (var i in self.similars) {
                self.createSimilar(self.similars[i], function () {
                    handled++;
                    if (handled >= self.similars.length) {
                        cb(self.similars);
                    }
                });
            }
        } else cb(null);
    };

    this.createCategory = function (category, cb) {
        category.save(function () {
            var Style = require('./style'),
                style = new Style({
                category    : category.name,
                culturalAct : self.name
            });
            style.save(function () {
                cb(category);
            });
        });
    };

    this.createCategories = function (cb) {
        if(self.categories && self.categories.length > 0){
            var handled = 0;

            for (var i in self.categories) {
                self.createCategory(self.categories[i], function () {
                    handled++;
                    if (handled >= self.categories.length) {
                        cb(self.categories);
                    }
                });
            }
        } else cb(null);
    };

    this.createMusician = function (musician, cb) {
        musician.save(function () {
            var Participate = require('./participate'),
                participate = new Participate({
                musician    : musician.name,
                band        : self.name
            });
            participate.save(function () {
                cb(musician);
            });
        });
    };

    this.createMusicians = function (cb) {
        if(self.musicians && self.musicians.length > 0){
            var handled = 0;

            for (var i in self.musicians) {
                self.createMusician(self.musicians[i], function () {
                    handled++;
                    if (handled >= self.musicians.length) {
                        cb(self.musicians);
                    }
                });
            }
        } else {
            cb(null);
        }
    };
};

Band.find = function (name, cb) {
    require('./get')(
        "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&autocorrect=1&api_key=206336a6642d03f381ec036dc6eb07f9&format=json&artist=" + name,
        function (lastFMBand) {
            lastFMBand = lastFMBand.artist;
                if(lastFMBand) {

                var Musician = require('./musician'),
                    bandMembers = [],
                    tempBandMembers = lastFMBand.bandmembers;

                if(tempBandMembers){
                    for(var i in tempBandMembers.member) {
                        bandMembers.push(new Musician ({
                            name   : tempBandMembers.member[i].name
                        }));
                    }
                }

                var similars = [],
                    tempSimilars = lastFMBand.similar;
                
                if(tempSimilars) {          
                    for(var i in tempSimilars.artist) {
                        similars.push(new Band ({
                            name   : tempSimilars.artist[i].name
                        }));
                    }
                }

                var Category = require('./category'),
                    categories = [],
                    tempCategories = lastFMBand.tags;
                
                if(tempCategories) {
                    for(var i in tempCategories.tag) {
                        categories.push(new Category ({
                            name   : tempCategories.tag[i].name
                        }));
                    }
                }

                var place = null;
                if(lastFMBand.bio){
                    if(lastFMBand.bio.placeformed)
                        place = lastFMBand.bio.placeformed;
                }

                var band = new Band ({
                        name       : lastFMBand.name,
                        similars   : similars,
                        musicians  : bandMembers,
                        categories : categories,
                        country    : place
                    });

                cb(band)
            }
            else console.log("Banda Nao Encontrada!" + name);
        }
    );
};

module.exports = Band;