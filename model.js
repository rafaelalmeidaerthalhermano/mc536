/*------------------------------------------------------------------------------
 * Model do recomendador
 */
var mysql = require('mysql'),
    connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : 'Aim3eif7',
      database : 'social',
    }),
    http = require('http');

function compareValue (a, b) {
    if(a.value < b.value)
        return 1;
    if(a.value > b.value)
        return -1;
    return 0
}

function min (a, b) {
    if(a > b)
        return b;
    return a
}

/*
 * Executa uma query no banco de dados
 *
 * @param cb
 */
function db (query, data, cb) {
    connection.query(query, data, cb);  
}

/*
 * Faz uma requisição HTTP para outro servidor
 *
 * @param cb
 */
function Get (url , cb) {
    http.get(url, function(httpResponse) {
        var response = '';
        httpResponse.on('data', function (data) {
            response += data;
        });
        httpResponse.on('end', function () {
            cb(JSON.parse(response.toString()));
        });
    });
}

/*------------------------------------------------------------------------------
 * Entidade país
 *
 * @property name
 */
var Country = function (params) {
    var self = this;

    this.name = params.name;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
    this.save = function (cb) {
        db(
            'INSERT INTO `country` SET ?',
            {
                'name' : this.name,
            },
            function () {
                if (cb) {
                    cb(self);
                }
            }
        );
    };
};

/*
 * Busca o país na API da geoname
 *
 * @param name
 * @param cb
 */
Country.find = function (name, cb) {

    if (name) {
        var url = 'http://dev.virtualearth.net/REST/v1/Locations/' + name + '?' +
                  'output=json&' +
                  'key=Ap7rxE2Zsd4JrfEpq17pREQ6u6SjmQVPWwu3-BjSXJeGzwQYE641aiGxU25B_8TQ'


        Get(
            url,
            function (data) {
                var country;

                var place = data.resourceSets[0].resources[0].name;
                if (!place) {
                    return cb(null);
                }

                country = new Country ({
                    name : place
                });

                if (cb) {
                    cb(country);
                }
            }
        );
    } else if (cb) {
        cb(null);
    }
};

exports.Country = Country;

/*------------------------------------------------------------------------------
 * Entidade cidade
 *
 * @property name
 * @property country
 */
var City = function (params) {
    var self = this;

    this.name = params.name;
    this.country = params.country;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
    this.save = function (cb) {
        self.createCountry(function (country) {
            if (country) {
                self.country = country.name;
            }

            db(
                'INSERT INTO `city` SET ?',
                {
                    'name' : self.name,
                    'country' : self.country,
                },
                function () {
                    if (cb) {
                        cb(self);
                    }
                }
            );
        });
    };

    /*
     * Salva o país da cidade no banco de dados
     *
     * @param cb
     */
    this.createCountry = function(cb) {
        Country.find(self.country, function (country) {
            if(country) {
                country.save(function () {
                    if (cb) {
                        cb(country);
                    }
                });
            } else if (cb) {
                cb(null);
            }  
        });
    };
};

/*
 * Busca a cidade na api da geoname
 *
 * @param name
 * @param cb
 */
City.find = function (name, cb) {
    if (name) {
        var url = 'http://dev.virtualearth.net/REST/v1/Locations/' + name + ' br?' +
                  'output=json&' +
                  'key=Ap7rxE2Zsd4JrfEpq17pREQ6u6SjmQVPWwu3-BjSXJeGzwQYE641aiGxU25B_8TQ'
        
         Get(
            url,
            function (data) {
                var city ;

                data = data.resourceSets[0].resources[0].name; 
                data = data.replace(/[/,]+[a-zA-Z]*/ , '');
                city = new City({
                    name : data,
                    country : 'Brasil'
                });
                if (cb) {
                    cb(city);
                }
            }
        ); 
    } else if (cb) {
        cb(null);
    }
};

exports.City = City;

/*------------------------------------------------------------------------------
 * Entidade categoria
 *
 * @property name
 */
var Category = function (params) {
    var self = this;

    this.name = params.name;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
    this.save = function (cb) {
        db(
            'INSERT INTO `category` SET ?',
            {
                'name' : self.name
            },
            function () {
                if (cb) {
                    cb(self);
                }
            }
        );
    };
};

exports.Category = Category;

/*------------------------------------------------------------------------------
 * Entidade stilo
 *
 * @property category
 * @property culturalAct
 */
var Style = function (params) {
    var self = this;

    this.category = params.category;
    this.culturalAct = params.culturalAct;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
    this.save = function (cb) {
        db(
            'INSERT INTO `style` SET ?',
            {
                'category' : this.category,
                'culturalAct' : this.culturalAct
            },
            function () {
                cb(self);
            }
        );
    };
};

exports.Style = Style;

/*------------------------------------------------------------------------------
 * Entidade ator
 *
 * @property name
 */
var Actor = function (params) {
    var self = this;

    this.name = params.name;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
    this.save = function (cb) {
        db(
            'INSERT INTO `actor` SET ?',
            {
                'name' : self.name
            },
            function () {
                if (cb) {
                    cb(self);
                }
            }
        );
    };
};

exports.Actor = Actor;

/*------------------------------------------------------------------------------
 * Relação atuação
 *
 * @property actor
 * @property movie
 */
var Act = function (params) {
    var self = this;

    this.actor = params.actor;
    this.movie = params.movie;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
    this.save = function (cb) {
        db(
            'INSERT INTO `act` SET ?',
            {
                'actor' : self.actor,
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

exports.Act = Act;

/*------------------------------------------------------------------------------
 * Entidade diretor
 *
 * @property name
 */
var Director = function (params) {
    var self = this;

    this.name = params.name;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
    this.save = function (cb) {
        db(
            'INSERT INTO `director` SET ?',
            {
                'name' : self.name
            },
            function () {
                if (cb) {
                    cb(self);
                }
            }
        );
    };
};

exports.Director = Director;

/*------------------------------------------------------------------------------
 * Relação direção
 *
 * @property director
 * @property movie
 */
var Direct = function (params) {
    var self = this;

    this.director = params.director;
    this.movie = params.movie;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
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

exports.Direct = Direct;

/*------------------------------------------------------------------------------
 * Entidade filme
 *
 * @property name
 * @property plot
 * @property IMDBrating
 * @property IMDBvotes
 * @property directors
 * @property actors
 * @property categories
 */
var Movie = function (params) {
    var self = this;

    this.name = params.name;
    this.plot = params.plot;
    this.IMDBrating = params.IMDBrating.replace("N/A", 0);
    this.IMDBvotes = params.IMDBvotes.replace("N/A", 0);
    this.directors = params.directors;
    this.actors = params.actors;
    this.categories = params.categories;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
    this.save = function (cb) {
        var directorsCreated = false,
            actorsCreated = false,
            categoriesCreated = false;

        self.createCulturalAct(function () {
            self.createMovie(function () {
                self.createDirectors(function () {
                    directorsCreated = true;
                    if (
                        directorsCreated &&
                        actorsCreated &&
                        categoriesCreated &&
                        cb
                    ) {
                        cb(self);
                    }
                });
                self.createActors(function () {
                    actorsCreated = true;
                    if (
                        directorsCreated &&
                        actorsCreated &&
                        categoriesCreated &&
                        cb
                    ) {
                        if (cb) {
                            cb(self);
                        }
                    }
                });
                self.createCategories(function () {
                    categoriesCreated = true;
                    if (
                        directorsCreated &&
                        actorsCreated &&
                        categoriesCreated &&
                        cb
                    ) {
                        if (cb) {
                            cb(self);
                        }
                    }
                });

            });
        });
    };

    /*
     * Insere a entidade filme
     *
     * @param cb
     */
    this.createMovie = function (cb) {
        db(
            'INSERT INTO `movie` SET ?',
            {
                'name' : self.name,
                'plot' : self.plot,
                'IMDBrating' : self.IMDBrating,
                'IMDBvotes' : self.IMDBvotes,
            },
            function () {
                if (cb) {
                    cb(self);
                }
            }
        );
    };

    /*
     * Insere entidade ato cultural
     *
     * @param cb
     */
    this.createCulturalAct = function (cb) {
        db(
            'INSERT INTO `culturalAct` SET ?',
            {
                'name' : self.name,
            },
            function () {
                if (cb) {
                    cb({name : self.name});
                }
            }
        );
    };

    /*
     * Insere entidade diretor
     *
     * @param cb
     */
    this.createDirector = function (director, cb) {
        director.save(function () {
            var direct = new Direct({
                director : director.name,
                movie : self.name
            });

            direct.save(function () {
                if (cb) {
                    cb(director);
                }
            });
        });
    };

    /*
     * Insere todos os diretores
     *
     * @param cb
     */
    this.createDirectors = function (cb) {
        var handled = 0;

        for (var i in self.directors) {
            if (self.directors[i])
            self.createDirector(self.directors[i], function () {
                handled++;
                if (handled >= self.directors.length) {
                    if (cb) {
                        cb(self.directors);
                    }
                }
            });
        }
    };

    /*
     * Insere entidade categoria
     *
     * @param cb
     */
    this.createCategory = function (category, cb) {
        category.save(function () {
            var style = new Style({
                category : category.name,
                culturalAct : self.name
            });
            
            style.save(function () {
                if (cb) {
                    cb(category);
                }
            });
        });
    };

    /*
     * Insere todas as categorias
     *
     * @param cb
     */
    this.createCategories = function (cb) {
        var handled = 0;

        for (var i in self.categories) {
            if (self.categories[i])
            self.createCategory(self.categories[i], function () {
                handled++;
                if (handled >= self.categories.length) {
                    if (cb) {
                        cb(self.categories);
                    }
                }
            });
        }
    };

    /*
     * Insere entidade ator
     *
     * @param cb
     */
    this.createActor = function (actor, cb) {
        actor.save(function () {
            var act = new Act({
                actor : actor.name,
                movie : self.name
            });

            act.save(function () {
                if (cb) {
                    cb(actor);
                }
            });
        });
    };

    /*
     * Insere todos os atores
     *
     * @param cb
     */
    this.createActors = function (cb) {
        var handled = 0;
        for (var i in self.actors) {
            if (self.actors[i])
            self.createActor(self.actors[i], function () {
                handled++;
                if (handled >= self.actors.length) {
                    if (cb) {
                        cb(self.actors);
                    }
                }
            });
        }
    };
};

/*
 * Busca o filme na omdb
 *
 * @param name
 * @param cb
 */
Movie.find = function (name, cb) {
    Get(
        "http://www.omdbapi.com/?i=" + name,
        function (tempMovie) {

            var directors = [],
                tempDirectors = [];

            if(tempMovie.Director)
                tempDirectors = tempMovie.Director.split(', ');

            for(var i in tempDirectors) {
                directors.push(new Director ({
                    name   : tempDirectors[i]
                }));
            }

            var actors = [],
                tempActors = [];

            if(tempMovie.Actors)
                tempActors = tempMovie.Actors.split(', ');
            
            for(var i in tempActors) {
                actors.push(new Actor ({
                    name   : tempActors[i]
                }));
            }

            var categories = [],
                tempCategories = [];
            
            if(tempMovie.Genre)
                tempCategories = tempMovie.Genre.split(', ');
            
            for(var i in tempCategories) {
                categories.push(new Category ({
                    name   : tempCategories[i]
                }));
            }

            var movie = new Movie ({
                    name : tempMovie.Title,
                    plot : tempMovie.Plot,
                    IMDBrating: tempMovie.imdbRating,
                    IMDBvotes : tempMovie.imdbVotes,
                    directors : directors,
                    actors : actors,
                    categories : categories
                });

            if (cb) {
                cb(movie);
            }
        }
    );
};

exports.Movie = Movie;

/*------------------------------------------------------------------------------
 * Entidade musico
 *
 * @property name
 */
var Musician = function (params) {
    var self = this;

    this.name = params.name;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
    this.save = function (cb) {
        db(
            'INSERT INTO `musician` SET ?',
            {
                'name' : self.name
            },
            function () {
                if (cb) {
                    cb(self);
                }
            }
        );
    };
};

exports.Musician = Musician;

/*------------------------------------------------------------------------------
 * Relação participação em banda
 *
 * @property musician
 * @property band
 */
var Participate = function (params) {
    var self = this;

    this.musician = params.musician;
    this.band = params.band;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
    this.save = function (cb) {
        db(
            'INSERT INTO `participate` SET ?',
            {
                'musician' : this.musician,
                'band' : this.band
            },
            function () {
                if (cb) {
                    cb(self);
                }
            }
        );
    };
};

exports.Participate = Participate;

/*------------------------------------------------------------------------------
 * Relação bandas similares
 *
 * @property band
 * @property similar
 */
var Similar = function (params) {
    var self = this;

    this.band = params.band;
    this.similar = params.similar;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
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

exports.Similar = Similar;

/*------------------------------------------------------------------------------
 * Entidade banda
 *
 * @property name
 * @property country
 * @property similars
 * @property musicians
 * @property categories
 */
var Band = function (params) {
    var self = this;

    this.name = params.name;
    this.country = params.country;
    this.similars = params.similars;
    this.musicians = params.musicians;
    this.categories = params.categories;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
    this.save = function (cb) {
        var similarsCreated = true,
            musiciansCreated = false,
            categoriesCreated = false;

        self.createCulturalAct(function () {
                self.createCountry(function (country) {
                    
                    if(country) {
                        self.country = country.name;
                    }
                    else {
                        self.country = null;
                    }

                    self.createBand(function () {
                        self.createSimilars(function () {
                            similarsCreated = true;
                            if (
                                similarsCreated &&
                                musiciansCreated &&
                                categoriesCreated &&
                                cb
                            ) {
                                cb();
                            }
                        });
                        self.createMusicians(function (err) {
                            musiciansCreated = true;
                            if (
                                similarsCreated &&
                                musiciansCreated &&
                                categoriesCreated &&
                                cb
                            ) {
                                cb();
                            }
                        });
                        self.createCategories(function (err) {
                            categoriesCreated = true;
                            if (
                                similarsCreated &&
                                musiciansCreated &&
                                categoriesCreated &&
                                cb
                            ) {
                                cb();
                            }
                        });
                    });
                });
        });
    };

    /*
     * Insere entidade banda
     *
     * @param cb
     */
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

    /*
     * Insere entidade ato cultural
     *
     * @param cb
     */
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

    /*
     * Insere entidade país
     *
     * @param cb
     */
    this.createCountry = function (cb) {
        if(self.country){
            Country.find(self.country, function (country) {
                if(country)
                    country.save(function () {
                        cb(country);
                    });
                else cb(null);
            });
        } else cb(null);
    };

    /*
     * Insere entidade similar
     *
     * @param cb
     */
    this.createSimilar = function (band, cb) {
        band.save(function () {
            var similar = new Similar({
                band        : self.name,
                similar     : band.name
            });

            similar.save(function () {
                cb(band);
            });
        });
    };

    /*
     * Insere todos os similares
     *
     * @param cb
     */
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

    /*
     * Insere entidade categoria
     *
     * @param cb
     */
    this.createCategory = function (category, cb) {
        category.save(function () {
            var style = new Style({
                category    : category.name,
                culturalAct : self.name
            });

            style.save(function () {
                cb(category);
            });
        });
    };

    /*
     * Insere todas as categorias
     *
     * @param cb
     */
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

    /*
     * Insere entidade musico
     *
     * @param cb
     */
    this.createMusician = function (musician, cb) {
        musician.save(function () {
            var participate = new Participate({
                musician    : musician.name,
                band        : self.name
            });

            participate.save(function () {
                cb(musician);
            });
        });
    };

    /*
     * Insere todos os musicos
     *
     * @param cb
     */
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

/*
 * Busca a banda na lastFM
 *
 * @param name
 * @param cb
 */
Band.find = function (name, cb) {
    Get(
        'http://ws.audioscrobbler.com/2.0/?' +
        'method=artist.getinfo&' +
        'autocorrect=1&' +
        'api_key=206336a6642d03f381ec036dc6eb07f9&' +
        'format=json&' +
        'artist=' + name,
        function (lastFMBand) {
            lastFMBand = lastFMBand.artist;
                if(lastFMBand) {

                var bandMembers = [],
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

                var categories = [],
                    tempCategories = lastFMBand.tags;
                
                if(tempCategories) {
                    for(var i in tempCategories.tag) {
                        categories.push(new Category ({
                            name   : tempCategories.tag[i].name
                        }));
                    }
                }

                var band = new Band({
                    name       : lastFMBand.name,
                    similars   : similars,
                    musicians  : bandMembers,
                    categories : categories,
                    country    : null
                });

                if(lastFMBand.bio && lastFMBand.bio.placeformed){
                    band.country = lastFMBand.bio.placeformed;
                    cb(band);
                } else {
                    Get("http://musicbrainz.org/ws/2/artist?limit=1&fmt=json&query="+name, function (MusicBrainz) {
                        if(MusicBrainz && MusicBrainz.artist && MusicBrainz.artist[0] && MusicBrainz.artist[0].country) {
                            band.country = MusicBrainz.artist[0].country;
                        }
                        cb(band);
                    });
                }
            } else {
                console.log("Banda Nao Encontrada!" + name);
            }
        }
    );
};

exports.Band = Band;

/*------------------------------------------------------------------------------
 * Relação conhecer
 *
 * @property person
 * @property colleague
 */
var Know = function (params) {
    var self = this;

    this.person = params.person;
    this.colleague = params.colleague;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
    this.save = function (cb) {
        db(
            'INSERT INTO `know` SET ?',
            {
                'person' : self.person,
                'colleague': self.colleague
            },
            function () {
                if (cb) {
                    cb(self);
                }
            }
        );
    };

    /*
     * Remove entidade do banco de dados
     *
     * @param cb
     */
    this.remove = function (cb) {
        db(
            'DELETE FROM `know` WHERE ?',
            {
                'person' : self.person,
                'colleague': self.colleague
            },
            function () {
                if (cb) {
                    cb(self);
                }
            }
        );
    };
};

exports.Know = Know;

/*------------------------------------------------------------------------------
 * Relação curtir
 *
 * @property person
 * @property culturalAct
 * @property rating
 */
var Like = function (params) {
    var self = this;

    this.person = params.person;
    this.culturalAct = params.culturalAct;
    this.rating = params.rating;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
    this.save = function (cb) {
        if (this.culturalAct.indexOf('http://en.wikipedia.org/wiki/') > -1) {
            this.culturalAct = this.culturalAct.replace('http://en.wikipedia.org/wiki/', '');
            this.createBand(function (band) {
                self.culturalAct = band.name;
                self.createLike(cb);
            });
        } else {
            this.culturalAct = this.culturalAct.replace("http://www.imdb.com/title/", "").replace("/", "");
            this.createMovie(function (movie) {
                self.culturalAct = movie.name;
                self.createLike(cb);
            });
        }
    };
    
    /*
     * Cria o like no banco de dados
     *
     * @param cb
     */
    this.createLike = function (cb) {
        db(
            'INSERT INTO `like` SET ?',
            {
                'person' : self.person,
                'culturalAct': self.culturalAct,
                'rating' : self.rating
            },
            function () {
                if (cb) {
                    cb(self);
                }
            }
        );
    };
    
    /*
     * Insere a banda no banco de dados
     *
     * @param cb
     */
    this.createBand = function (cb) {
        Band.find(self.culturalAct, function (band) {
            band.save(function () {
                if (cb) {
                    cb(band);
                }
            });
        });
    };
    
    /*
     * Insere o filme no banco de dados
     *
     * @param cb
     */
    this.createMovie = function (cb) {
        Movie.find(self.culturalAct, function (movie) {
            movie.save(function () {
                if (cb) {
                    cb(movie);
                }
            });
        });
    };
    
    /*
     * Remove entidade do banco de dados
     *
     * @param cb
     */
    this.remove = function (cb) {
        db(
            'DELETE FROM `like` WHERE person = "'+self.person+'" AND culturalAct = "'+self.culturalAct+'"',
            {},
            function (err) {
                console.log(err)
                if (cb) {
                    cb(self);
                }
            }
        );
    };
};

exports.Like = Like;

/*------------------------------------------------------------------------------
 * Entidade pessoa
 *
 * @property uri
 * @property name
 * @property hometown
 */
var Person = function (params) {
    var self = this;

    this.uri = params.uri;
    this.name = params.name;
    this.hometown = params.hometown;

    /*
     * Salva entidade no banco de dados
     *
     * @param cb
     */
    this.save = function (cb) {
        self.createHometown(function (city) {

            if(city) {
                self.hometown = city.name;
            } else {
                self.hometown = null;
            }

            db(
                'INSERT INTO `person` SET ?',
                {
                    'uri' : self.uri,
                    'name' : self.name,
                    'hometown' : self.hometown
                },
                function () {
                    if (cb) {
                        cb(self);
                    }
                }
            );
        });
    };

    /*
     * Cria a cidade da pessoa no banco de dados
     *
     * @param cb
     */
    this.createHometown = function (cb) {
        City.find(self.hometown, function (city) {
            if(city) {
                city.save(function () {
                    if (cb) {
                        cb(city);
                    }
                });
            } else if (cb) {
                cb(city);
            }
        });
    };

    this.recommendFriend = function (cb) {
        var query1 = function(cb){
            //Pessoas que conhecem self.uri mas não são conhecidas por self.uri
            db(
                'select a.person from know a where a.colleague = "'+self.uri+'" and a.person not in( select colleague from know where person = "'+self.uri+'")',
                {},
                cb
            );
        };

        var query2 = function(cb){
            //Regra de Associação para 2 pessoas (amigos de X também são amigos de Y)
            db(
                'SELECT a.recommend recommend, MAX(a.value) value FROM know k, linkPeopleView a WHERE k.person = "'+self.uri+'" AND k.colleague = a.colleague AND a.recommend not in ( select p.colleague from know p WHERE p.person = "'+self.uri+'")AND a.recommend <> "'+self.uri+'" GROUP BY a.recommend ORDER BY value desc',
                {},
                cb
            );
        };

        var query3 = function(cb){
            //Pessoas com grupos de amigos em comum
            db(
                'select b.person, count(*) commonFriends from know a, know b where b.person not in( select colleague from know where person = "'+self.uri+'" ) and a.colleague = b.colleague and a.person = "'+self.uri+'" and a.person <> b.person group by b.person order by commonFriends desc',
                {},
                cb
            );
        };

        var query4 = function(cb){
            //Pessoas com gostos parecidos
            db(
                'select b.person, COUNT(*) commonLikes, sum(5-abs(a.rating-b.rating))/count(*) + 0.4*count(*) Value from `like` a, `like` b where a.person = "'+self.uri+'" and b.person <> a.person and b.person not in( select colleague from know where person = "'+self.uri+'" ) and a.culturalAct = b.culturalAct group by b.person order by Value desc, commonLikes desc',
                {},
                cb
            );
        };

        var query5 = function(cb){
            //Pessoas que os amigos conhecem
            db(
                'select b.colleague person, count(*) knownByFriends from know a, know b where a.person = "'+self.uri+'" AND a.colleague = b.person AND b.colleague not in( select colleague from know where person = "'+self.uri+'" ) AND b.colleague <> a.person group by b.colleague order by knownByFriends desc',
                {},
                cb
            );
        };

        var pickBetter = function (set1, set2, set3, set4, set5, cb) {
            var results = {};
            var k;

            for(var i in set1) {
                if(results[set1[i].person]){
                    results[set1[i].person] += 2;
                }
                else {
                    results[set1[i].person] = 2;
                }
            }

            for(var i in set2) {
                if(results[set2[i].recommend]){
                    results[set2[i].recommend] += set2[i].value;
                }
                else {
                    results[set2[i].recommend] = set2[i].value;
                }
            }

            for(var i in set3) {
                if(results[set3[i].person]){
                    results[set3[i].person] += set3[i].commonFriends/set3[0].commonFriends;
                }
                else {
                    results[set3[i].person] = set3[i].commonFriends/set3[0].commonFriends;
                }
            }

            for(var i in set4) {
                if(results[set4[i].person]){
                    results[set4[i].person] += set4[i].commonLikes/set4[0].commonLikes;
                }
                else {
                    results[set4[i].person] = set4[i].commonLikes/set4[0].commonLikes;
                }
            }

            for(var i in set5) {
                if(results[set5[i].person]){
                    results[set5[i].person] += set5[i].knownByFriends/set5[0].knownByFriends;
                }
                else {
                    results[set5[i].person] = set5[i].knownByFriends/set5[0].knownByFriends;
                }
            }

            var set = [];
            for (var i in results) {
                set.push({
                    name : i,
                    value : results[i]
                })
            }
            set.sort(compareValue)

            if(cb)
                cb(set.slice(0,min(5, set.length)))
        };

        
        var q1 = false, q2 = false, q3 = false, q4 = false, q5 = false;
        var set1, set2, set3, set4, set5;

        query1( function (err, set) {
            set1 = set;
            q1 = true;
            if(q1 && q2 && q3 && q4 && q5)
                pickBetter(set1, set2, set3, set4, set5, cb);
        });

        query2( function (err, set) {
            set2 = set;
            q2 = true;
            if(q1 && q2 && q3 && q4 && q5)
                pickBetter(set1, set2, set3, set4, set5, cb);
        });

        query3( function (err, set) {
            set3 = set;
            q3 = true;
            if(q1 && q2 && q3 && q4 && q5)
                pickBetter(set1, set2, set3, set4, set5, cb);
        });

        query4( function (err, set) {
            set4 = set;
            q4 = true;
            if(q1 && q2 && q3 && q4 && q5)
                pickBetter(set1, set2, set3, set4, set5, cb);
        });

        query5( function (err, set) {
            set5 = set;
            q5 = true;
            if(q1 && q2 && q3 && q4 && q5)
                pickBetter(set1, set2, set3, set4, set5, cb);
        });
    };

    this.recommendMovie = function (cb) {
        var query1 = function(cb){
            //filmes curtidos pelos amigos levando em consideracao as notas atribuidas
            db(
                ' select l.culturalAct act, AVG(rating) averageRating, count(*) likedByFriends, AVG(rating)+0.5*count(*) value from `like` l, know k where k.person = "'+self.uri+'" AND k.colleague = l.person AND l.culturalAct not in( select culturalAct from `like` where person = "'+self.uri+'" ) AND l.culturalAct in( select name from movie ) group by l.culturalAct order by value desc',
                {},
                cb
            );
        };

        var query2 = function(cb){
            // regra de associacao de 2 atos
            db(
                'select a.recommend, MAX(a.value) value from `like` l, AssociationAct2 a where l.person = "'+self.uri+'"   and l.culturalAct = a.act and a.recommend not in ( select p.culturalAct  from `like` p  where p.person = "'+self.uri+'" ) AND a.recommend in( select name from movie ) group by a.recommend order by value desc',
                {},
                cb
            );
        };

        var query3 = function(cb){
            // regra de associacao de 3 atos
            db(
                'select a.recommend, MAX(a.value) value from `like` l1, `like` l2, AssociationAct3 a where l1.person = "'+self.uri+'" and l2.person = l1.person and l1.culturalAct = a.act1 and l2.culturalAct = a.act2 and a.recommend not in( select culturalAct from `like` where person = "'+self.uri+'" ) AND a.recommend in( select name from movie ) group by a.recommend order by value desc',
                {},
                cb
            );
        };

        var query4 = function(cb){
            //filmes com generos em comum com os curtidos
            db(
                'select c.act2 recommend, AVG(common) average, count(*) timesEqual, AVG(common)+0.08*count(*) value from common_genre c where c.act1 in ( select culturalAct from `like` where person = "'+self.uri+'" ) AND c.act2 not in ( select culturalAct from `like` where person = "'+self.uri+'" ) AND c.act2 in( select name from movie ) group by c.act2 order by value desc',
                {},
                cb
            );
        };


        var pickBetter = function (set1, set2, set3, set4, cb) {
            var results = {};
            var k;

            for(var i in set1) {
                if(results[set1[i].act]){
                    results[set1[i].act] += 2*set1[i].value/set1[0].value;
                }
                else {
                    results[set1[i].act] = 2*set1[i].value/set1[0].value;
                }
            }

            for(var i in set2) {
                if(results[set2[i].recommend]){
                    results[set2[i].recommend] += 3*set2[i].value/set2[0].value;
                }
                else {
                    results[set2[i].recommend] = 3*set2[i].value/set2[0].value;
                }
            }

            for(var i in set3) {
                if(results[set3[i].recommend]){
                    results[set3[i].recommend] += 3.5*set3[i].value/set3[0].value;
                }
                else {
                    results[set3[i].recommend] = 3.5*set3[i].value/set3[0].value;
                }
            }

            for(var i in set4) {
                if(results[set4[i].recommend]){
                    results[set4[i].recommend] += set4[i].value/set4[0].value;
                }
                else {
                    results[set4[i].recommend] = set4[i].value/set4[0].value;
                }
            }

            var set = [];
            for (var i in results) {
                set.push({
                    name : i,
                    value : results[i]
                })
            }
            set.sort(compareValue)

            if(cb)
                cb(set.slice(0,min(5, set.length)))
        };

        
        var q1 = false, q2 = false, q3 = false, q4 = false;
        var set1, set2, set3, set4;

        query1( function (err, set) {
            set1 = set;
            q1 = true;
            if(q1 && q2 && q3 && q4)
                pickBetter(set1, set2, set3, set4, cb);
        });

        query2( function (err, set) {
            set2 = set;
            q2 = true;
            if(q1 && q2 && q3 && q4)
                pickBetter(set1, set2, set3, set4, cb);
        });

        query3( function (err, set) {
            set3 = set;
            q3 = true;
            if(q1 && q2 && q3 && q4)
                pickBetter(set1, set2, set3, set4, cb);
        });

        query4( function (err, set) {
            set4 = set;
            q4 = true;
            if(q1 && q2 && q3 && q4)
                pickBetter(set1, set2, set3, set4, cb);
        });
    };

    this.recommendBand = function (cb) {
        var query1 = function(cb){
            //Bandas curtidas pelos amigos levando em consideracao as notas atribuidas
            db(
                ' select l.culturalAct act, AVG(rating) averageRating, count(*) likedByFriends, AVG(rating)+0.5*count(*) value from `like` l, know k where k.person = "'+self.uri+'" AND k.colleague = l.person AND l.culturalAct not in( select culturalAct from `like` where person = "'+self.uri+'" ) AND l.culturalAct in( select name from band ) group by l.culturalAct order by value desc',
                {},
                cb
            );
        };

        var query2 = function(cb){
            // regra de associacao de 2 atos
            db(
                'select a.recommend, MAX(a.value) value from `like` l, AssociationAct2 a where l.person = "'+self.uri+'"   and l.culturalAct = a.act and a.recommend not in ( select p.culturalAct  from `like` p  where p.person = "'+self.uri+'" ) AND a.recommend in( select name from band ) group by a.recommend order by value desc',
                {},
                cb
            );
        };

        var query3 = function(cb){
            // regra de associacao de 3 atos
            db(
                'select a.recommend, MAX(a.value) value from `like` l1, `like` l2, AssociationAct3 a where l1.person = "'+self.uri+'" and l2.person = l1.person and l1.culturalAct = a.act1 and l2.culturalAct = a.act2 and a.recommend not in( select culturalAct from `like` where person = "'+self.uri+'" ) AND a.recommend in( select name from band ) group by a.recommend order by value desc',
                {},
                cb
            );
        };

        var query4 = function(cb){
            //Atos Musicais com generos em comum com os curtidos
            db(
                'select c.act2 recommend, AVG(common) average, count(*) timesEqual, AVG(common)+0.08*count(*) value from common_genre c where c.act1 in ( select culturalAct from `like` where person = "'+self.uri+'" ) AND c.act2 not in ( select culturalAct from `like` where person = "'+self.uri+'" ) AND c.act2 in( select name from band ) group by c.act2 order by value desc',
                {},
                cb
            );
        };

        var query5 = function(cb){
            //Atos Musicais similares aos curtidos
            db(
                'select s.similar recommend, count(*) numb from similar s where s.band in( select culturalAct from `like` where person = "'+self.uri+'" ) AND s.similar not in( select culturalAct from `like` where person = "'+self.uri+'" ) group by s.similar order by numb desc',
                {},
                cb
            );
        };


        var pickBetter = function (set1, set2, set3, set4, set5, cb) {
            var results = {};
            var k;

            for(var i in set1) {
                if(results[set1[i].act]){
                    results[set1[i].act] += 2*set1[i].value/set1[0].value;
                }
                else {
                    results[set1[i].act] = 2*set1[i].value/set1[0].value;
                }
            }

            for(var i in set2) {
                if(results[set2[i].act]){
                    results[set2[i].act] += 3*set2[i].value/set2[0].value;
                }
                else {
                    results[set2[i].act] = 3*set2[i].value/set2[0].value;
                }
            }

            for(var i in set3) {
                if(results[set3[i].act]){
                    results[set3[i].act] += 3.5*set3[i].value/set3[0].value;
                }
                else {
                    results[set3[i].act] = 3.5*set3[i].value/set3[0].value;
                }
            }

            for(var i in set4) {
                if(results[set4[i].act]){
                    results[set4[i].act] += set4[i].value/set4[0].value;
                }
                else {
                    results[set4[i].act] = set4[i].value/set4[0].value;
                }
            }

            for(var i in set5) {
                if(results[set5[i].act]){
                    results[set5[i].act] += set5[i].numb/set5[0].numb;
                }
                else {
                    results[set5[i].act] = set5[i].numb/set5[0].numb;
                }
            }

            var set = [];
            for (var i in results) {
                set.push({
                    name : i,
                    value : results[i]
                })
            }
            set.sort(compareValue)

            if(cb)
                cb(set.slice(0,min(5, set.length)))
        };

        
        var q1 = false, q2 = false, q3 = false, q4 = false, q5 = false;
        var set1, set2, set3, set4, set5;

        query1( function (err, set) {
            set1 = set;
            q1 = true;
            if(q1 && q2 && q3 && q4 && q5)
                pickBetter(set1, set2, set3, set4, set5, cb);
        });

        query2( function (err, set) {
            set2 = set;
            q2 = true;
            if(q1 && q2 && q3 && q4 && q5)
                pickBetter(set1, set2, set3, set4, set5, cb);
        });

        query3( function (err, set) {
            set3 = set;
            q3 = true;
            if(q1 && q2 && q3 && q4 && q5)
                pickBetter(set1, set2, set3, set4, set5, cb);
        });

        query4( function (err, set) {
            set4 = set;
            q4 = true;
            if(q1 && q2 && q3 && q4 && q5)
                pickBetter(set1, set2, set3, set4, set5, cb);
        });

        query5( function (err, set) {
            set5 = set;
            q5 = true;
            if(q1 && q2 && q3 && q4 && q5)
                pickBetter(set1, set2, set3, set4, set5, cb);
        });
    };

    this.recommend = function (cb) {
        var result = {},
            friendsHandled = false,
            moviesHandled = false,
            bandsHandled = false;

        self.recommendFriend(function (friends) {
            friendsHandled = true;
            result.friends = friends;
            if (friendsHandled && moviesHandled && bandsHandled) {
                cb(result);
            }
        });

        self.recommendMovie(function (movies) {
            moviesHandled = true;
            result.movies = movies;
            if (friendsHandled && moviesHandled && bandsHandled) {
                cb(result);
            }
        });

        self.recommendBand(function (bands) {
            bandsHandled = true;
            result.bands = bands;
            if (friendsHandled && moviesHandled && bandsHandled) {
                cb(result);
            }
        });
    }

};

Person.find = function (id, cb) {
    db(
        'SELECT * FROM `person` WHERE `uri` = "' + id + '"', {}, function (err, persons) {
            var person = new Person({
                    name : persons[0].name,
                    uri : persons[0].uri,
                    hometown : persons[0].hometown
                }),
                knowsHandled = false,
                bandsHandled = false,
                moviesHandled = false;
            
            person.knows = [];
            person.likes = {
                bands  : [],
                movies : []
            };
            
            /* Pegando os amigos */
            db('SELECT `know`.`colleague`, `know`.`person` FROM `know` WHERE `know`.`person` = "' + id + '"', {}, function (err, knows) {
                for (var i in knows) {
                    person.knows.push(new Know(knows[i]));
                }
                knowsHandled = true;
                if (knowsHandled && bandsHandled && moviesHandled) {
                    person.recommend(function (recomendations) {
                        person.recomendations = recomendations;
                        cb(person);
                    });
                }
            });
            
            /* Pegando as musicas curtidas */
            db('SELECT `like`.`culturalAct`, `like`.`person` FROM `like`, `band` WHERE `like`.`person` = "' + id + '" AND `band`.`name` = `like`.`culturalAct`', {}, function (err, likes) {
                for (var i in likes) {
                    person.likes.bands.push(new Like(likes[i]));
                }
                bandsHandled = true;
                if (knowsHandled && bandsHandled && moviesHandled) {
                    person.recommend(function (recomendations) {
                        person.recomendations = recomendations;
                        cb(person);
                    });
                }
            });
            
            /* Pegando os filmes curtidos curtidas */
            db('SELECT `like`.`culturalAct`, `like`.`person` FROM `like`, `movie` WHERE `like`.`person` = "' + id + '" AND `movie`.`name` = `like`.`culturalAct`', {}, function (err, likes) {
                for (var i in likes) {
                    person.likes.movies.push(new Like(likes[i]));
                }
                moviesHandled = true;
                if (knowsHandled && bandsHandled && moviesHandled) {
                    person.recommend(function (recomendations) {
                        person.recomendations = recomendations;
                        cb(person);
                    });
                }
            });
        }
    );
};

exports.Person = Person;