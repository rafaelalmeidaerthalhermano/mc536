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

/*
open('/pessoas.xml', function (persons) {
    for (var i in persons.Persons.Person) {
        var person = new require('./person') ({
                uri:persons.Persons.Person[i].$.uri.replace("http://www.ic.unicamp.br/MC536/2013/1/",""),
                name:persons.Persons.Person[i].$.name,
                hometown:persons.Persons.Person[i].$.hometown
            });
        person.save();
    }
});
*/

open('/CurteFilme.xml', function (likesMovies) {
    for (var i in likesMovies.AllLikesMovie.LikesMovie) {
    	require('./movie').find(
    		likesMovies.AllLikesMovie.LikesMovie[i].$.movieUri.replace("http://www.imdb.com/title/", "").replace("/", ""),
    		function (movie) {
    			movie.save();
    		}
		)
    }
});
/*
	criar pessoa

	var person = new require('./person') ({
		uri      : '',
		name     : '',
		hometown : ''
	});

	person.save(function () {
	
	});

	buscar filme
	require('./movie').find(name, function (movie) {
		movie.save(function () { CRIAR O LIKE });
	});

	buscar banda
	require('./band').find(function (band) {
		band.save(function () { CRIAR O LIKE });
	});

	buscar localização
	require('./location').find(function (location) {
		location.save(function () {});
	});
*/
