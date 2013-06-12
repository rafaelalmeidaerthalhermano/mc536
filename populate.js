/* Abrir arquivos xml, montar objetos e salva-los */
var fs = require('fs'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();
var open = function (file, cb) {
    fs.readFile(__dirname + file, function(err, xml) {
        parser.parseString(xml, function (err, json) {
            cb(json);
        });
    });
}


open('/pessoas.xml', function (persons) {
    var handled = 0;

    for (var i in persons.Persons.Person) {
        var Person = require('./person'),
        	person = new Person ({
                uri:persons.Persons.Person[i].$.uri.replace("http://www.ic.unicamp.br/MC536/2013/1/",""),
                name:persons.Persons.Person[i].$.name,
                hometown:persons.Persons.Person[i].$.hometown
            });
        person.save(function () {
            handled++;
            if(handled >= persons.Persons.Person.length){
                CreateKnows();
                CreateMovies();
                CreateBands(mergeBands);
            }
        });
    }
});

function CreateMovies(){
    var createMovie = function (movie_name, person, rating) {
        require('./movie').find(
            movie_name,
            function (movie) {
                movie.save(function(){
                    var Like = require('./like'),
                        like = new Like({
                            person : person,
                            culturalAct : movie.name,
                            rating : rating
                        });
                    like.save()
                });
            }
        );
    };

    open('/CurteFilme.xml', function (likesMovies) {
        for (var i in likesMovies.AllLikesMovie.LikesMovie) {
        	createMovie(
                likesMovies.AllLikesMovie.LikesMovie[i].$.movieUri.replace("http://www.imdb.com/title/", "").replace("/", ""),
                likesMovies.AllLikesMovie.LikesMovie[i].$.person.replace("http://www.ic.unicamp.br/MC536/2013/1/",""),
                likesMovies.AllLikesMovie.LikesMovie[i].$.rating
            );
        }
    });
}

function CreateBands(cb){

    var createBand = function (band_name, person, rating, cb) {
        require('./band').find(
            band_name,
            function (band) {
                band.save(function(){
                    var Like = require('./like'),
                        like = new Like({
                            person : person,
                            culturalAct : band_name,
                            rating : rating
                        });
                    like.save(cb);
                });
            }
        );
    };

    open('/CurteMusica.xml', function (likesMusic) {
        var handled = 0;

        for (var i in likesMusic.AllLikesMusic.LikesMusic) {
            var musicUri = likesMusic.AllLikesMusic.LikesMusic[i].$.bandUri.replace("http://en.wikipedia.org/wiki/", "");
            musicUri = musicUri.replace('%28', '(');
            musicUri = musicUri.replace('%29', ')');
            musicUri = musicUri.replace(/_/g, ' ');
            musicUri = musicUri.replace(/[\s\(]+[(A-Za-z\s)*]+[\)]/, "");
            musicUri = musicUri.replace("band", "");
            createBand(
                musicUri,
                likesMusic.AllLikesMusic.LikesMusic[i].$.person.replace("http://www.ic.unicamp.br/MC536/2013/1/",""),
                likesMusic.AllLikesMusic.LikesMusic[i].$.rating,
                function(){
                    handled++;
                    if(handled >= likesMusic.AllLikesMusic.LikesMusic.length) {
                        cb()
                    }
                }
            );            
        }
    });
}


function mergeBand (musicName) {
    require('./get')("http://musicbrainz.org/ws/2/artist?limit=1&fmt=json&query="+musicName, function (music) {
        if(music && music.artist && music.artist[0] && music.artist[0].country) {
            require('./country').find(music.artist[0].country, function(country){
                if(country){
                    country.save(function(){
                        require('./db')(
                            'UPDATE band SET location = "' + country.name + '" WHERE name = "' + musicName + '"',
                            {},
                            function(){

                            }
                        );

                    });
                }
            },
            "&country="
            );
            
        }
        else console.log("Ato musical sem pais:" +musicName);
    });
}

function mergeBands () {
    require('./db')('SELECT name FROM band WHERE location IS NULL', {}, function (err, bands) {
        var i = 0;
        setInterval(function () {
            if(i < bands.length) {
                mergeBand(bands[i].name)
                i++;
            }
        }, 1000);
    });
}


function CreateKnows() {
    open('/Conhece.xml', function (knows) {
        for (var i in knows.AllKnows.Knows) {
            var Know = require('./know'),
                know = new Know({
                    person : knows.AllKnows.Knows[i].$.person.replace("http://www.ic.unicamp.br/MC536/2013/1/",""),
                    colleague : knows.AllKnows.Knows[i].$.colleague.replace("http://www.ic.unicamp.br/MC536/2013/1/","")
                });
            know.save();
        }
    });
}