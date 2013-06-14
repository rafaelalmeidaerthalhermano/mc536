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

var model = require('../../model');



/*
open('/pessoas.xml', function (persons) {
    var i = 0;

    function save(person, cb) {
        var persona = new model.Person ({
            uri : person.uri.replace("http://www.ic.unicamp.br/MC536/2013/1/",""),
            name : person.name,
            hometown : person.hometown
        });
        persona.save(cb);
    }

    function next() {
        if (i < persons.Persons.Person.length) {
            save(persons.Persons.Person[i].$, next);
            console.log("Pessoa "+i+" inserida...")
            i++;
        } else {
            Dump();
        }
    }
    
    next();
});*/
Dump();

function Dump(){
    /*open('/Conhece.xml', function (knows) {
        for (var i in knows.AllKnows.Knows) {
            var know = new model.Know({
                    person : knows.AllKnows.Knows[i].$.person.replace("http://www.ic.unicamp.br/MC536/2013/1/",""),
                    colleague : knows.AllKnows.Knows[i].$.colleague.replace("http://www.ic.unicamp.br/MC536/2013/1/","")
                });
            know.save(function () {
                console.log(know);
            });
        }
    });*/
/*
    open('/CurteFilme.xml', function (likesMovies) {
        for (var i in likesMovies.AllLikesMovie.LikesMovie) {
            var like = new model.Like({
                culturalAct : likesMovies.AllLikesMovie.LikesMovie[i].$.movieUri,
                person : likesMovies.AllLikesMovie.LikesMovie[i].$.person.replace("http://www.ic.unicamp.br/MC536/2013/1/",""),
                rating : likesMovies.AllLikesMovie.LikesMovie[i].$.rating
            });
            like.save(function () {
                //console.log(like);
            });
        }
    });*/

    
    open('/CurteMusica.xml', function (likesMusic) {
        var i = 0;

        function save(like, cb) {
            var newLike = new model.Like ({
                person : like.person.replace("http://www.ic.unicamp.br/MC536/2013/1/",""),
                culturalAct : like.bandUri.replace(/[\((\%28)]+[A-Za-z0-9\s\-]*[\)(\%29)]+/, ''),
                rating : like.rating
            });
            newLike.save(cb);
        }

        function next() {
            if (i < likesMusic.AllLikesMusic.LikesMusic.length) {
                save(likesMusic.AllLikesMusic.LikesMusic[i].$, next);
                console.log("Curtir Musica "+i+" inserida...")
                i++;
            }
        }
        
        next();

    });
}

