
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

function refreshMaterializedViewAssociationAct3 (cb){
	require('./db')(
		'drop table AssociationAct3temp; create table AssociationAct3temp( act1 VARCHAR(50) NOT NULL, act2 VARCHAR(50) NOT NULL, recommend VARCHAR(50) NOT NULL, common INTEGER, likeAB INTEGER, percentage FLOAT, value FLOAT );  insert into AssociationAct3temp select a.culturalAct act1, b.culturalAct act2, c.culturalAct recommend, count(*) common, d.numb likeAB, 100*count(*)/d.numb percentage, d.numb/17+2*count(*)/d.numb value from `like` a, `like` b, `like` c, LikeBoth d where a.person = b.person and b.person = c.person and c.culturalAct <> b.culturalAct and c.culturalAct <> a.culturalAct and d.act1 = a.culturalAct and d.act2 = b.culturalAct group by a.culturalAct, b.culturalAct, c.culturalAct having count(*) > 4 and d.numb <> count(*) order by value desc;',
		{},
		function(err) {

			//// FAZER COM QUE ESSA TRANSACAO ABAIXO JAMAIS SEJA INTERROMPIDA PELO BANCO DE DADOS PARA CONCORRENCIA!

			require('./db')(
				'drop table AssociationAct3; create table AssociationAct3( act1 VARCHAR(50) NOT NULL, act2 VARCHAR(50) NOT NULL, recommend VARCHAR(50) NOT NULL, common INTEGER, likeAB INTEGER, percentage FLOAT, value FLOAT );  insert into AssociationAct3 select * from AssociationAct3temp;  drop table AssociationAct3temp;',
				{},
				cb
			);
		}
	);
}


function recommendFriend (personUri, cb) {
	var query1 = function(cb){
		//Pessoas que conhecem personUri mas não são conhecidas por personUri
		require('./db')(
			'select a.person from know a where a.colleague = "'+personUri+'" and a.person not in( select colleague from know where person = "'+personUri+'")',
			{},
			cb
		);
	};

	var query2 = function(cb){
		//Regra de Associação para 2 pessoas (amigos de X também são amigos de Y)
		require('./db')(
			'SELECT a.recommend recommend, MAX(a.value) value FROM know k, linkPeopleView a WHERE k.person = "'+personUri+'" AND k.colleague = a.colleague AND a.recommend not in ( select p.colleague from know p WHERE p.person = "'+personUri+'")AND a.recommend <> "'+personUri+'" GROUP BY a.recommend ORDER BY value desc',
			{},
			cb
		);
	};

	var query3 = function(cb){
		//Pessoas com grupos de amigos em comum
		require('./db')(
			'select b.person, count(*) commonFriends from know a, know b where b.person not in( select colleague from know where person = "'+personUri+'" ) and a.colleague = b.colleague and a.person = "'+personUri+'" and a.person <> b.person group by b.person order by commonFriends desc',
			{},
			cb
		);
	};

	var query4 = function(cb){
		//Pessoas com gostos parecidos
		require('./db')(
			'select b.person, COUNT(*) commonLikes, sum(5-abs(a.rating-b.rating))/count(*) + 0.4*count(*) Value from `like` a, `like` b where a.person = "'+personUri+'" and b.person <> a.person and b.person not in( select colleague from know where person = "'+personUri+'" ) and a.culturalAct = b.culturalAct group by b.person order by Value desc, commonLikes desc',
			{},
			cb
		);
	};

	var query5 = function(cb){
		//Pessoas que os amigos conhecem
		require('./db')(
			'select b.colleague person, count(*) knownByFriends from know a, know b where a.person = "'+personUri+'" AND a.colleague = b.person AND b.colleague not in( select colleague from know where person = "'+personUri+'" ) AND b.colleague <> a.person group by b.colleague order by knownByFriends desc',
			{},
			cb
		);
	};

	var pickBetter = function (set1, set2, set3, set4, set5, cb) {
		var results = { names : new Array(), values : new Array()};
		var aux = new Array();
		var k;

		for(var i in set1) {
			k = results.names.indexOf(set1[i].person)
			if(k == -1){
				results.names.push(set1[i].person)
				results.values.push(2)
			}
			else {
				results.values[k] = results.values[k]+2
			}
		}

		for(var i in set2) {
			k = results.names.indexOf(set2[i].recommend)
			if(k == -1){
				results.names.push(set2[i].recommend)
				results.values.push(set2[i].value)
			}
			else {
				results.values[k] = results.values[k]+set2[i].value
			}
		}

		for(var i in set3) {
			k = results.names.indexOf(set3[i].person)
			if(k == -1){
				results.names.push(set3[i].person)
				results.values.push(set3[i].commonFriends/set3[0].commonFriends)
			}
			else {
				results.values[k] = results.values[k]+set3[i].commonFriends/set3[0].commonFriends
			}
		}	

		for(var i in set4) {
			k = results.names.indexOf(set4[i].person)
			if(k == -1){
				results.names.push(set4[i].person)
				results.values.push(set4[i].commonLikes/set4[0].commonLikes)
			}
			else {
				results.values[k] = results.values[k]+set4[i].commonLikes/set4[0].commonLikes
			}
		}

		for(var i in set5) {
			k = results.names.indexOf(set5[i].person)
			if(k == -1){
				results.names.push(set5[i].person)
				results.values.push(set5[i].knownByFriends/set5[0].knownByFriends)
			}
			else {
				results.values[k] = results.values[k]+set5[i].knownByFriends/set5[0].knownByFriends
			}
		}
		
		for(var i in results.names){
			aux.push(
				{
					name : results.names[i],
					value : results.values[i]
				}
			);
		}
		aux.sort(compareValue)
		console.log(aux.slice(0,min(5, aux.length)))
		if(cb)
			cb(personUri)
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
}

function recommendMovie (personUri, cb) {
	var query1 = function(cb){
		//filmes curtidos pelos amigos levando em consideracao as notas atribuidas
		require('./db')(
			' select l.culturalAct act, AVG(rating) averageRating, count(*) likedByFriends, AVG(rating)+0.5*count(*) value from `like` l, know k where k.person = "'+personUri+'" AND k.colleague = l.person AND l.culturalAct not in( select culturalAct from `like` where person = "'+personUri+'" ) AND l.culturalAct in( select name from movie ) group by l.culturalAct order by value desc',
			{},
			cb
		);
	};

	var query2 = function(cb){
		// regra de associacao de 2 atos
		require('./db')(
			'select a.recommend, MAX(a.value) value from `like` l, AssociationAct2 a where l.person = "'+personUri+'"   and l.culturalAct = a.act and a.recommend not in ( select p.culturalAct  from `like` p  where p.person = "'+personUri+'" ) AND a.recommend in( select name from movie ) group by a.recommend order by value desc',
			{},
			cb
		);
	};

	var query3 = function(cb){
		// regra de associacao de 3 atos
		require('./db')(
			'select a.recommend, MAX(a.value) value from `like` l1, `like` l2, AssociationAct3 a where l1.person = "'+personUri+'" and l2.person = l1.person and l1.culturalAct = a.act1 and l2.culturalAct = a.act2 and a.recommend not in( select culturalAct from `like` where person = "'+personUri+'" ) AND a.recommend in( select name from movie ) group by a.recommend order by value desc',
			{},
			cb
		);
	};

	var query4 = function(cb){
		//filmes com generos em comum com os curtidos
		require('./db')(
			'select c.act2 recommend, AVG(common) average, count(*) timesEqual, AVG(common)+0.08*count(*) value from common_genre c where c.act1 in ( select culturalAct from `like` where person = "'+personUri+'" ) AND c.act2 not in ( select culturalAct from `like` where person = "'+personUri+'" ) AND c.act2 in( select name from movie ) group by c.act2 order by value desc',
			{},
			cb
		);
	};


	var pickBetter = function (set1, set2, set3, set4, cb) {
		var results = { names : new Array(), values : new Array()};
		var aux = new Array();
		var k;

		for(var i in set1) {
			k = results.names.indexOf(set1[i].act)
			if(k == -1){
				results.names.push(set1[i].act)
				results.values.push(2*set1[i].value/set1[0].value)
			}
			else {
				results.values[k] = results.values[k]+2*set1[i].value/set1[0].value
			}
		}

		for(var i in set2) {
			k = results.names.indexOf(set2[i].recommend)
			if(k == -1){
				results.names.push(set2[i].recommend)
				results.values.push(3*set2[i].value/set2[0].value)
			}
			else {
				results.values[k] = results.values[k]+3*set2[i].value/set2[0].value
			}
		}

		for(var i in set3) {
			k = results.names.indexOf(set3[i].recommend)
			if(k == -1){
				results.names.push(set3[i].recommend)
				results.values.push(3.5*set3[i].value/set3[0].value)
			}
			else {
				results.values[k] = results.values[k]+3.5*set3[i].value/set3[0].value
			}
		}	

		for(var i in set4) {
			k = results.names.indexOf(set4[i].recommend)
			if(k == -1){
				results.names.push(set4[i].recommend)
				results.values.push(set4[i].value/set4[0].value)
			}
			else {
				results.values[k] = results.values[k]+set4[i].value/set4[0].value
			}
		}

		for(var i in results.names){
			aux.push(
				{
					name : results.names[i],
					value : results.values[i]
				}
			);
		}
		aux.sort(compareValue)
		console.log(aux.slice(0,min(10, aux.length)))
		if(cb)
			cb(personUri)
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

}


function recommendBand (personUri, cb) {
	var query1 = function(cb){
		//Bandas curtidas pelos amigos levando em consideracao as notas atribuidas
		require('./db')(
			' select l.culturalAct act, AVG(rating) averageRating, count(*) likedByFriends, AVG(rating)+0.5*count(*) value from `like` l, know k where k.person = "'+personUri+'" AND k.colleague = l.person AND l.culturalAct not in( select culturalAct from `like` where person = "'+personUri+'" ) AND l.culturalAct in( select name from band ) group by l.culturalAct order by value desc',
			{},
			cb
		);
	};

	var query2 = function(cb){
		// regra de associacao de 2 atos
		require('./db')(
			'select a.recommend, MAX(a.value) value from `like` l, AssociationAct2 a where l.person = "'+personUri+'"   and l.culturalAct = a.act and a.recommend not in ( select p.culturalAct  from `like` p  where p.person = "'+personUri+'" ) AND a.recommend in( select name from band ) group by a.recommend order by value desc',
			{},
			cb
		);
	};

	var query3 = function(cb){
		// regra de associacao de 3 atos
		require('./db')(
			'select a.recommend, MAX(a.value) value from `like` l1, `like` l2, AssociationAct3 a where l1.person = "'+personUri+'" and l2.person = l1.person and l1.culturalAct = a.act1 and l2.culturalAct = a.act2 and a.recommend not in( select culturalAct from `like` where person = "'+personUri+'" ) AND a.recommend in( select name from band ) group by a.recommend order by value desc',
			{},
			cb
		);
	};

	var query4 = function(cb){
		//Atos Musicais com generos em comum com os curtidos
		require('./db')(
			'select c.act2 recommend, AVG(common) average, count(*) timesEqual, AVG(common)+0.08*count(*) value from common_genre c where c.act1 in ( select culturalAct from `like` where person = "'+personUri+'" ) AND c.act2 not in ( select culturalAct from `like` where person = "'+personUri+'" ) AND c.act2 in( select name from band ) group by c.act2 order by value desc',
			{},
			cb
		);
	};

	var query5 = function(cb){
		//Atos Musicais similares aos curtidos
		require('./db')(
			'select s.similar recommend, count(*) numb from similar s where s.band in( select culturalAct from `like` where person = "'+personUri+'" ) AND s.similar not in( select culturalAct from `like` where person = "'+personUri+'" ) group by s.similar order by numb desc',
			{},
			cb
		);
	};


	var pickBetter = function (set1, set2, set3, set4, set5, cb) {
		var results = { names : new Array(), values : new Array()};
		var aux = new Array();
		var k;

		for(var i in set1) {
			k = results.names.indexOf(set1[i].act)
			if(k == -1){
				results.names.push(set1[i].act)
				results.values.push(2*set1[i].value/set1[0].value)
			}
			else {
				results.values[k] = results.values[k]+2*set1[i].value/set1[0].value
			}
		}

		for(var i in set2) {
			k = results.names.indexOf(set2[i].recommend)
			if(k == -1){
				results.names.push(set2[i].recommend)
				results.values.push(3*set2[i].value/set2[0].value)
			}
			else {
				results.values[k] = results.values[k]+3*set2[i].value/set2[0].value
			}
		}

		for(var i in set3) {
			k = results.names.indexOf(set3[i].recommend)
			if(k == -1){
				results.names.push(set3[i].recommend)
				results.values.push(3.5*set3[i].value/set3[0].value)
			}
			else {
				results.values[k] = results.values[k]+3.5*set3[i].value/set3[0].value
			}
		}	

		for(var i in set4) {
			k = results.names.indexOf(set4[i].recommend)
			if(k == -1){
				results.names.push(set4[i].recommend)
				results.values.push(set4[i].value/set4[0].value)
			}
			else {
				results.values[k] = results.values[k]+set4[i].value/set4[0].value
			}
		}


		for(var i in set5) {
			k = results.names.indexOf(set5[i].recommend)
			if(k == -1){
				results.names.push(set5[i].recommend)
				results.values.push(set5[i].numb/set5[0].numb)
			}
			else {
				results.values[k] = results.values[k]+set5[i].numb/set5[0].numb
			}
		}

		for(var i in results.names){
			aux.push(
				{
					name : results.names[i],
					value : results.values[i]
				}
			);
		}
		aux.sort(compareValue)
		console.log(aux.slice(0,min(10, aux.length)))
		if(cb)
			cb(personUri)
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

}

function recommend(personUri, cb){
	personUri = personUri.replace("drop", "");
	require('./db')(
		'SELECT name FROM person WHERE uri = "'+personUri+'"',
		{},
		function (err, person_set){
			if(person_set[0] == undefined)
				console.log(personUri+" nao consta na base de dados!")
			else {
				console.log("")
				console.log("Amigos para "+personUri+":")
				recommendFriend(personUri, function() {
					console.log("")
					console.log("Fimes para "+personUri+":")
					recommendMovie(personUri, function() {
						console.log("")
						console.log("Atos Musicais para "+personUri+":")
						recommendBand(personUri, function(){
							console.log("")
							if(cb)
								cb(personUri)
						})
						
					});
				});
				
			}
		}
	);
}


recommend("augustomorgan", function (){
	recommend("jonatanvalongo", function () {
		recommend("brunocarvalho", function () {
			recommend("rafaelhermano", function (){
				console.log("FIM")
			})
		})
	})

});
