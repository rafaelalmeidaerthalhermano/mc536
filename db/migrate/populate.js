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




open('/pessoas.xml', function (persons) {
    var handled = 0;

    for (var i in persons.Persons.Person) {
        var person = new model.Person ({
                uri : persons.Persons.Person[i].$.uri.replace("http://www.ic.unicamp.br/MC536/2013/1/",""),
                name : persons.Persons.Person[i].$.name,
                hometown : persons.Persons.Person[i].$.hometown
            });
        person.save(function () {
            handled++;
            if(handled >= persons.Persons.Person.length){
                Dump();
            }
        });
    }
});


function Dump(){
    open('/Conhece.xml', function (knows) {
        for (var i in knows.AllKnows.Knows) {
            var know = new model.Know({
                    person : knows.AllKnows.Knows[i].$.person.replace("http://www.ic.unicamp.br/MC536/2013/1/",""),
                    colleague : knows.AllKnows.Knows[i].$.colleague.replace("http://www.ic.unicamp.br/MC536/2013/1/","")
                });
            know.save(function () {
                console.log(know);
            });
        }
    });

    open('/CurteFilme.xml', function (likesMovies) {
        for (var i in likesMovies.AllLikesMovie.LikesMovie) {
            var like = new model.Like({
                culturalAct : likesMovies.AllLikesMovie.LikesMovie[i].$.movieUri,
                person : likesMovies.AllLikesMovie.LikesMovie[i].$.person.replace("http://www.ic.unicamp.br/MC536/2013/1/",""),
                rating : likesMovies.AllLikesMovie.LikesMovie[i].$.rating
            });
            like.save(function () {
                console.log(like);
            });
        }
    });

    open('/CurteMusica.xml', function (likesMusic) {
        for (var i in likesMusic.AllLikesMusic.LikesMusic) {
            var like = new model.Like({
                culturalAct : likesMusic.AllLikesMusic.LikesMusic[i].$.bandUri,
                person : likesMusic.AllLikesMusic.LikesMusic[i].$.person.replace("http://www.ic.unicamp.br/MC536/2013/1/",""),
                rating : likesMusic.AllLikesMusic.LikesMusic[i].$.rating
            });
            like.save(function () {
                console.log(like);
            });           
        }
    });
}

