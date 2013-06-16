var express = require('express'),
    app = new express(),
    model = require('./model');



/* Configurando o server */
app.configure(function () {
    "use strict";
    app.use(express.static(__dirname + '/public'));

    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);

    app.use(function(error, request, response, next) {
        if (error) {
            response.send({error : error});
        } else {
            next();
        }
    });
});

app.get('/', function (request, response) {
    response.sendfile('public/index.html');
});

/* Pessoas */
app.post("/person", function (request, response) {
    var person = new model.Person({
        uri      : request.param('uri'),
        name     : request.param('name'),
        hometown : request.param('hometown')
    });

    person.save(function () {
        response.send({person : person});
    });
});

function findPerson (request, response, next) {
    model.Person.find(request.params.id, function (person) {
        request.person = person;
        next();
    });
}

app.get("/person/:id", findPerson, function (request, response) {
    response.send({person : request.person});
});

app.post("/person/:id/like", function (request, response) {
    var like = new model.Like({
        person      : request.params.id,
        culturalAct : request.param('culturalAct'),
        rating      : request.param('rating')
    });

    like.save(function () {
        response.send({like : like});
    });
});

app.del("/person/:id/like/:like_id", findPerson, function (request, response) {
    for (var i in request.person.likes.movies) {
        if (request.person.likes.movies[i].culturalAct === request.params.like_id) {
            request.person.likes.movies[i].remove();
        }
    }
    response.send(null);
});

app.post("/person/:id/know", function (request, response) {
    var know = new model.Know({
        person      : request.params.id,
        colleague   : request.param('colleague')
    });

    know.save(function () {
        response.send({know : know});
    });
});

app.listen(process.env.PORT || 8080);