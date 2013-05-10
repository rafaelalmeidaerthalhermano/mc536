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
        var directorsCreated = false,
            actorsCreated = false,
            categoriesCreated = false;

        self.createCulturalAct(function () {
            self.createMovie(function () {
                self.createDirectors(function () {
                    directorsCreated = true;
                    if (directorsCreated && actorsCreated && categoriesCreated) {
                        if(cb)
                            cb();
                    }
                });
                self.createActors(function () {
                    actorsCreated = true;
                    if (directorsCreated && actorsCreated && categoriesCreated) {
                        if(cb)
                            cb();
                    }
                });
                self.createCategories(function () {
                    categoriesCreated = true;
                    if (directorsCreated && actorsCreated && categoriesCreated) {
                        if(cb)
                            cb();
                    }
                });

            });
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
                if (cb) {
                    cb(self);
                }
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
            var Direct = require('./direct'),
                direct = new Direct({
                director : director.name,
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
            if (self.directors[i])
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
            if (self.categories[i])
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
            var Act = require('./act'),
                act = new Act({
                actor    : actor.name,
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
            if (self.actors[i])
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
    require('./get')(
        "http://www.omdbapi.com/?i=" + name,
        function (tempMovie) {
            var Director = require('./director'),
                directors = [],
                tempDirectors = tempMovie.Director.split(', ');

            for(var i in tempDirectors) {
                directors.push(new Director ({
                    name   : tempDirectors[i]
                }));
            }

            var Actor = require('./actor'),
                actors = [],
                tempActors = tempMovie.Actors.split(', ');
            
            for(var i in tempActors) {
                actors.push(new Actor ({
                    name   : tempActors[i]
                }));
            }

            var Category = require('./category'),
                categories = [],
                tempCategories = tempMovie.Genre.split(', ');
            
            for(var i in tempCategories) {
                categories.push(new Category ({
                    name   : tempCategories[i]
                }));
            }

            var movie = new Movie ({
                    name      : tempMovie.Title,
                    plot      : tempMovie.Plot,
                    IMDBrating: tempMovie.imdbRating,
                    IMDBvotes : tempMovie.imdbVotes,
                    
                    directors : directors,
                    actors : actors,
                    categories : categories
                });

            cb(movie)
        }
    );
};

module.exports = Movie;