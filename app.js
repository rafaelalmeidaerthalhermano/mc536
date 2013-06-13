var express = require('express'),
    app = new express(),
    model = require('./model');

/* Pessoas */
app.post("/person", function (request, response) {

    var person = new model.Person({
        uri  : request.param('uri'),
        name : request.param('name'),
        uri  : request.param('hometown')
    });

    person.save(function (error) {
        if (error) {
            response.send({error : error});
        } else {
            response.send({person : person})
        }
    });
});

app.get("/person/:id", function (request, response) {
	model.Person.find(request.params.id, function (error, person) {
        if (error) {
            response.send({error : error});
        } else {
            response.send({person : person})
        }
    });
});

/* Amigos */
app.post("/person/:id/friends", function (request, response) {
    model.Person.find(request.params.id, function (error, person) {
        if (error) {
            response.send({error : error});
        } else {
            var know = new model.Know({
                person    : request.params.id,
                colleague : request.param('colleague')
            });

            know.save(function (error) {
                if (error) {
                    response.send({error : error});
                } else {
                    response.send({know : know});
                }
            });
        }
    });
});

app.get("/person/:id/friends/recomend", function (request, response) {
    /* Integrar com as maluquices do augusto */
});

app.del("/person/:id/friends/:friend_id", function (request, response) {
    model.Know.find(request.params.id, request.params.friend_id, function (error, know) {
        if (error) {
            response.send({error : error});
        } else {
            know.remove(function (error) {
                if (error) {
                    response.send({error : error});
                } else {
                    response.send(null);
                }
            });
        }
    });
});

/* Filmes */
app.post("/person/:id/movies", function (request, response) {
    model.Person.find(request.params.id, function (error, person) {
        if (error) {
            response.send({error : error});
        } else {
            var like = new model.Like({
                person      : request.params.id,
                culturalAct : request.param('culturalAct'),
                rating      : request.param('rating')
            });

            like.save(function (error) {
                if (error) {
                    response.send({error : error});
                } else {
                    response.send({like : like});
                }
            });
        }
    });
});

app.get("/person/:id/movies/recomend", function (request, response) {
    /* Integrar com as maluquices do augusto */
});

app.del("/person/:id/movies/:like_id", function (request, response) {
    model.Like.find(request.params.id, request.params.like_id, function (error, like) {
        if (error) {
            response.send({error : error});
        } else {
            like.remove(function (error) {
                if (error) {
                    response.send({error : error});
                } else {
                    response.send(null);
                }
            });
        }
    });
});

/* Musicas */
app.post("/person/:id/bands", function (request, response) {
    /* Vargas cria esse método análogo ao de filmes */
});

app.get("/person/:id/bands/recomend", function (request, response) {
    /* Integrar com as maluquices do augusto */
});

app.del("/person/:id/bands/:like_id", function (request, response) {
    /* Vargas cria esse método análogo ao de filmes */
});

app.listen(8080);