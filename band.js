var db = require('./db');

var Band = function (params) {
    var self = this;

    this.name = params.name;
    this.country = params.country;
    this.similars = params.similars;
    this.musicians = params.musicians;
    this.categories = params.categories;

    this.save = function (cb) {
        var locationCreated = false,
            similarsCreated = true,
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
                        self.createMusicians(function () {
                            musiciansCreated = true;
                            if (similarsCreated && musiciansCreated && categoriesCreated) {
                                cb();
                            }
                        });
                        self.createCategories(function () {
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
            'INSERT INTO `cultural_act` SET ?',
            {
                'name'     : self.name,
            },
            function () {
                cb({name : self.name});
            }
        );
    };

    this.createCountry = function (cb) {
        require('./country').find(self.country, function (country) {
            if(country)
                country.save(function () {
                    cb(country);
                });
            else cb(null);
        });
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
        var handled = 0;

        for (var i in self.similars) {
            self.createSimilars(self.similars[i], function () {
                handled++;
                if (handled >= self.similars.length) {
                    cb(self.similars);
                }
            });
        }
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

                var Similar = require('./similar'),
                    similars = [],
                    tempSimilars = lastFMBand.similar;
                
                if(tempSimilars) {          
                    for(var i in tempSimilars.artist) {
                        similars.push(new Similar ({
                            band   : lastFMBand.name,
                            similar: tempSimilars.artist[i].name
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

                //console.log(band);
                cb(band)
            }
            else console.log("Banda Nao Encontrada!" + name);
        }
    );


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