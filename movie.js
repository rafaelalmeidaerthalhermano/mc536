var db = require('./db');

var Movie = function (params) {
    var self = this;

    this.name = params.name;
    this.plot = params.plot;
    this.IMDBrating = params.IMDBrating;
    this.IMDBvotes = params.IMDBvotes;
    this.directors = params.directors;
    this.actors = params.actors;
    this.categories = params.categories;

    this.save = function (cb) {
        var culturalActCreated = false,
            directorsCreated = false,
            actorsCreated = false,
            categoriesCreated = false;

        self.createDirectors(function () {
            directorsCreated = true;
            if (directorsCreated && actorsCreated && categoriesCreated && culturalActCreated) {
                self.createMovie(cb);
            }
        });
        self.createActors(function () {
            actorsCreated = true;
            if (directorsCreated && actorsCreated && categoriesCreated && culturalActCreated) {
                self.createMovie(cb);
            }
        });
        self.createCategories(function () {
            categoriesCreated = true;
            if (directorsCreated && actorsCreated && categoriesCreated && culturalActCreated) {
                self.createMovie(cb);
            }
        });
        self.createCulturalAct(function () {
            culturalActCreated = true;
            if (directorsCreated && actorsCreated && categoriesCreated && culturalActCreated) {
                self.createMovie(cb);
            }
        });
    };

    this.createMovie = function (cb) {
        db(
            'INSERT INTO `movie` SET ?',
            {
                'name'      : self.name,
                'plot'      : self.plot,
                'IMDBrating': self.IMDBrating,
                'IMDBvotes' : self.IMDBvotes,
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

    this.createDirector = function (director, cb) {
        director.save(function () {
            var direct = new require('./direct')({
                director : director.name
                movie    : self.name
            });
            direct.save(function () {
                cb(director)
            });
        });
    };

    this.createDirectors = function (cb) {
        var handled = 0;

        for (var i in self.directors) {
            self.createDirector(self.directors[i], function () {
                handled++;
                if (handled >= self.directors.length) {
                    cb(self.directors);
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

    this.createActor = function (actor, cb) {
        actor.save(function () {
            var act = new require('./act')({
                actor    : actor.name
                movie    : self.name
            });
            act.save(function () {
                cb(actor);
            });
        });
    };

    this.createActors = function (cb) {
        var handled = 0;

        for (var i in self.actors) {
            self.createActor(self.actors[i], function () {
                handled++;
                if (handled >= self.actors.length) {
                    cb(self.actors);
                }
            });
        }
    };
};

Movie.find = function (name, cb) {
    //TODO implementar as chamadas pro omdb

    /*
    criar objeto filme para retornar no callback

    var movie = new Movie ({
        name      : '',
        plot      : '',
        IMDBrating: '',
        IMDBvotes : '',
        directors : [
            new new require('./director') ({
                name   : ''
            })
            ...
        ],
        actors : [
            new new require('./actor') ({
                name   : ''
            })
            ...
        ],
        categories : [
            new new require('./category') ({
                name   : ''
            })
            ...
        ]
    });

    cb(movie)
    */
};

module.exports = Movie;