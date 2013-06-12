-- Regras de Associação de 2 pessoas
create view knownByView as 
	select colleague, count(*) numb
	from know
	group by colleague;

create view maxKnowView as
	select MAX(numb) maximum
	from knownByView;

create view linkPeopleView as
select a.colleague, b.colleague recommend, count(*) common,
		c.numb knowA, count(*)/c.numb percentage,
		c.numb/m.maximum+1.5*count(*)/c.numb value
from know a, know b, knownByView c, maxKnowView m
where a.person = b.person and a.colleague <> b.colleague
		and c.colleague = a.colleague
group by a.colleague, b.colleague
having count(*) > 3 and c.numb <> count(*)
order by value desc;

select a.recommend, MAX(a.value) value
from know k, linkPeopleView a
where 	k.person = "jonatanvalongo"  
		and k.colleague = a.colleague
		and a.recommend not in (
			select p.colleague 
			from know p 
			where p.person = "jonatanvalongo"
		)
		and a.recommend <> "jonatanvalongo"
group by a.recommend
order by value desc
limit 15;


-- Pessoas que me conhecem que eu nao conheco
select a.person
from know a
where a.colleague = "jonatanvalongo"
	and a.person not in(
		select colleague
		from know
		where person = "jonatanvalongo");

-- pessoas desconhecidas com maior numbs de amigos em common
select b.person, count(*) common
from know a, know b
where b.person not in(
			select colleague
			from know
			where person = "jonatanvalongo"
		)
	and a.colleague = b.colleague
	and a.person = "jonatanvalongo"
	and a.person <> b.person
	group by b.person
	order by common desc;

-- Pessoas desconhecidas com maior numb de atos culturais curtidos em common
select b.person, count(*) common
from `like` a, `like` b
where a.person = "jonatanvalongo"
	and b.person <> a.person
	and b.person not in(
			select colleague
			from know
			where person = "jonatanvalongo"
		)
	and a.culturalAct = b.culturalAct
group by b.person
order by common desc
limit 10;



-- Pessoas desconhecidas com maior numb de atos culturais curtidos em common levando a nota em conta
select b.person, sum(abs(a.rating-b.rating)) Subtraction, sum(abs(a.rating-b.rating))/count(*) AVGSubtraction,
		sum(5-abs(a.rating-b.rating)) Similarity, sum(5-abs(a.rating-b.rating))/count(*) AVGSimilarity,
		COUNT(*) common, sum(5-abs(a.rating-b.rating))/count(*) + 0.4*count(*) Value
from `like` a, `like` b
where a.person = "augustomorgan"
	and b.person <> a.person
	and b.person not in(
			select colleague
			from know
			where person = "augustomorgan"
		)
	and a.culturalAct = b.culturalAct
group by b.person
order by Value desc, common desc
limit 3;



-- Desconhecidos que os amigos conhecem
select b.colleague person, count(*) numb
from know a, know b
where 	a.person = "augustomorgan"
		AND a.colleague = b.person
		AND b.colleague not in(
				select colleague
				from know
				where person = "augustomorgan"
			)
		AND b.colleague <> a.person
group by b.colleague
order by numb desc
limit 3;


----- Atos Culturais

create view likeMovie as
	select * from `like`
	where culturalAct in(
			select name
			from movie
		);

create view likeMusic as
	select * from `like`
	where culturalAct in(
			select name
			from band
		);

-- Atos culturais mais curtidos pelos meus amigos

select b.culturalAct Ato_recommendado, count(*) curtido_por_n_amigos
from `like` b
where 	b.person in(
				select colleague
				from know
				where person = "augustomorgan"
			)
		AND b.culturalAct not in(
				select culturalAct
				from `like`
				where person = "augustomorgan"
			)
group by b.culturalAct
order by curtido_por_n_amigos desc
limit 15;



-- regra de associacao de 2 atos
create view LikedBy as
	select culturalAct, count(*) numb
	from `like`
	group by culturalAct;

create view MaxLikedBy as
	select MAX(numb) maximum
	from LikedBy;

-- o 25 da divisao abaixo deve ser substituido pelo maior value de c.numb (curtidas do ato mais curtido)
-- pois eh o responsavel pela normalizacao. Da mesma forma o peso 2 deve ser alterado experimentalmente
create view AssociationAct2 as
select a.culturalAct act, b.culturalAct recommend, count(*) common,
		c.numb likeA, 100*count(*)/c.numb percentage,
		c.numb/m.maximum+2*count(*)/c.numb value
from `like` a, `like` b, LikedBy c, MaxLikedBy m
where a.person = b.person and a.culturalAct <> b.culturalAct
		and c.culturalAct = a.culturalAct
group by a.culturalAct, b.culturalAct
having count(*) > 2 and c.numb <> count(*)
order by value desc;



select a.recommend, MAX(a.value) value
from `like` l, AssociationAct2 a
where 	l.person = "augustomorgan"  
		and l.culturalAct = a.act
		and a.recommend not in (
			select p.culturalAct 
			from `like` p 
			where p.person = "augustomorgan"
		)
group by a.recommend
order by value desc
limit 15;




-- regra de associacao de 3 atos
create view LikeBoth as
	select a.culturalAct act1, b.culturalAct act2, count(*) numb
	from `like` a, `like` b
	where 	a.person = b.person
			and a.culturalAct <> b.culturalAct
	group by a.culturalAct, b.culturalAct;

-- aqui sera criada uma view materializada (sob forma de tabela).
-- Essa view deve ser recriada esporadicamente, a cada X novas inserções na base
-- de dados. Deve ser estática para realizar a recommendação em tempo habil,
-- ja que as regras de associacao ha estarao pre-calculadas

drop table AssociationAct3;
create table AssociationAct3(
	act1 VARCHAR(50) NOT NULL,
	act2 VARCHAR(50) NOT NULL,
	recommend VARCHAR(50) NOT NULL,
	common INTEGER,
	likeAB INTEGER,
	percentage FLOAT,
	value FLOAT
);

insert into AssociationAct3
select a.culturalAct act1, b.culturalAct act2, c.culturalAct recommend, count(*) common,
		d.numb likeAB, 100*count(*)/d.numb percentage,
		d.numb/17+2*count(*)/d.numb value
from `like` a, `like` b, `like` c, LikeBoth d
where 	a.person = b.person
		and b.person = c.person
		and c.culturalAct <> b.culturalAct
		and c.culturalAct <> a.culturalAct
		and d.act1 = a.culturalAct
		and d.act2 = b.culturalAct
group by a.culturalAct, b.culturalAct, c.culturalAct
having count(*) > 4 and d.numb <> count(*)
order by value desc;


select a.recommend, MAX(a.value) value
from `like` l1, `like` l2, AssociationAct3 a
where 	l1.person = "augustomorgan"
		and l2.person = l1.person
		and l1.culturalAct = a.act1
		and l2.culturalAct = a.act2
		and a.recommend not in(
				select culturalAct
				from `like`
				where person = "augustomorgan"
			)
group by a.recommend
order by value desc
limit 10;






-- regra de associacao de 3 atos
create view Like3Acts as
	select a.culturalAct act1, b.culturalAct act2, c.culturalAct act3, count(*) numb
	from `like` a, `like` b, `like` c
	where 	a.person = b.person
			and a.person = c.person
			and a.culturalAct <> b.culturalAct
			and a.culturalAct <> c.culturalAct
			and b.culturalAct <> c.culturalAct
	group by a.culturalAct, b.culturalAct, c.culturalAct;

create view MaxLike3Acts as
	select MAX(numb) maximum
	from Like3Acts;

-- aqui sera criada uma view materializada (sob forma de tabela).
-- Essa view deve ser recriada raramente, a cada X novas inserções na base
-- de dados. Deve ser estática para realizar a recommendação em tempo habil,
-- ja que as regras de associacao ha estarao pre-calculadas
-- Sua criação leva cerca de 45 minutos

drop table AssociationAct4;
create table AssociationAct4(
	act1 VARCHAR(50) NOT NULL,
	act2 VARCHAR(50) NOT NULL,
	act3 VARCHAR(50) NOT NULL,
	recommend VARCHAR(50) NOT NULL,
	common INTEGER,
	curtemAB INTEGER,
	percentage FLOAT,
	value FLOAT
);

insert into AssociationAct4
select a.culturalAct act1, b.culturalAct act2, e.culturalAct act3, c.culturalAct recommend, count(*) common,
		d.numb curtemABC, 100*count(*)/d.numb percentage,
		d.numb/m.maximum+2*count(*)/d.numb value
from `like` a, `like` b, `like` c, `like` e, Like3Acts d, MaxLike3Acts m
where 	a.person = b.person
		and b.person = c.person
		and c.person = e.person
		and c.culturalAct <> b.culturalAct
		and c.culturalAct <> a.culturalAct
		and c.culturalAct <> e.culturalAct
		and d.act1 = a.culturalAct
		and d.act2 = b.culturalAct
		and d.act3 = e.culturalAct
group by a.culturalAct, b.culturalAct, c.culturalAct
having count(*) > 4 and d.numb <> count(*)
order by value desc;


select a.recommend, MAX(a.value) value
from `like` l1, `like` l2, `like` l3, AssociationAct4 a
where 	l1.person = "augustomorgan"
		and l2.person = l1.person
		and l3.person = l1.person
		and l1.culturalAct = a.act1
		and l2.culturalAct = a.act2
		and l3.culturalAct = a.act3
		and a.recommend not in(
				select culturalAct
				from `like`
				where person = "augustomorgan"
			)
group by a.recommend
order by value desc
limit 10;




-- recommenda atos musicais similares
select s.similar recommend, count(*) numb
from similar s
where s.band in(
		select culturalAct
		from `like`
		where person = "brunocarvalho"
	)
	AND s.similar not in(
		select culturalAct
		from `like`
		where person = "brunocarvalho"
	)
group by s.similar
having count(*) > 1
order by numb desc
limit 10;


-- recommenda atos por generos em common
create view common_genre as
	select s1.culturalAct act1, s2.culturalAct act2, count(*) common
	from style s1, style s2
	where 	s1.culturalAct <> s2.culturalAct
			AND s1.category = s2.category
	group by s1.culturalAct, s2.culturalAct;

select c.act2 recommend, AVG(common) average, count(*) timesEqual, AVG(common)+0.08*count(*) value
	from common_genre c
	where 	c.act1 in (
				select culturalAct
				from `like`
				where person = "augustomorgan"
			)
			AND c.act2 not in (
				select culturalAct
				from `like`
				where person = "augustomorgan"
			)
	group by c.act2
	order by value desc
	limit 30;



-- filmes curtidos pelos amigos levando em consideracao as notas atribuidas
select l.culturalAct act, AVG(rating) averageRating, count(*) likedByFriends, AVG(rating)+0.5*count(*) value
from `like` l, know k
where 	k.person = "augustomorgan"
		AND k.colleague = l.person
		AND l.culturalAct not in(
				select culturalAct
				from `like`
				where person = "augustomorgan"
			)
group by l.culturalAct
order by value desc
limit 10;






