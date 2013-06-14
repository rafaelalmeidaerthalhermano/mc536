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
    });
}

app.get("/person/:id", findPerson, function (request, response) {
    response.send({person : request.person});
});

/* Amigos */
app.post("/person/:id/friends", findPerson, function (request, response) {
    var know = new model.Know({
        person    : request.params.id,
        colleague : request.param('colleague')
    });

    know.save(function () {
        response.send({know : know});
    });
});

app.get("/person/:id/friends/recomend", function (request, response) {
    /* Integrar com as maluquices do augusto */
});

app.del("/person/:id/friends/:friend_id", findPerson, function (request, response) {
    for (var i in request.person.knows) {
        if (request.person.knows[i].colleague === request.params.friend_id) {
            request.person.knows[i].remove();
        }
    }
    response.send(null);
});

/* Filmes */
app.post("/person/:id/movies", function (request, response) {
    var like = new model.Like({
        person      : request.params.id,
        culturalAct : request.param('culturalAct'),
        rating      : request.param('rating')
    });

    like.save(function () {
        response.send({like : like});
    });
});

app.get("/person/:id/movies/recomend", function (request, response) {
    /* Integrar com as maluquices do augusto */
});

app.del("/person/:id/movies/:like_id", findPerson, function (request, response) {
    for (var i in request.person.likes.movies) {
        if (request.person.likes.movies[i].culturalAct === request.params.like_id) {
            request.person.likes.movies[i].remove();
        }
    }
    response.send(null);
});

/* Musicas */
app.post("/person/:id/bands", function (request, response) {
    var like = new model.Like({
        person      : request.params.id,
        culturalAct : request.param('culturalAct'),
        rating      : request.param('rating')
    });

    like.save(function () {
        response.send({like : like});
    });
});

app.get("/person/:id/bands/recomend", function (request, response) {
    /* Integrar com as maluquices do augusto */
});

app.del("/person/:id/bands/:like_id", function (request, response) {
    for (var i in request.person.likes.bands) {
        if (request.person.likes.bands[i].culturalAct === request.params.like_id) {
            request.person.likes.bands[i].remove();
        }
    }
    response.send(null);
});

model.Person.find("augustomorgan", function (person) {
    //console.log(JSON.stringify(person))
    for(var i in person.likes.movies) {
        if(person.likes.movies[i].culturalAct === "The Hobbit: The Desolation of Smaug"){
            person.likes.movies[i].remove(function () {
                console.log("Removido")
            });
        }
    }
})

app.listen(process.env.PORT || 8080);