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



-- Regras de Associação de 2 pessoas
create view conhecem as 
	select colleague, count(*) numero
	from know
	group by colleague;


create view associa_pessoa as
select a.colleague, b.colleague recomend, count(*) comum,
		c.numero conhecemA, count(*)/c.numero porcentagem,
		c.numero/16+1.5*count(*)/c.numero valor
from know a, know b, conhecem c
where a.person = b.person and a.colleague <> b.colleague
		and c.colleague = a.colleague
group by a.colleague, b.colleague
having count(*) > 3 and c.numero <> count(*)
order by valor desc;

select a.recomend, MAX(a.valor) valor
from know k, associa_pessoa a
where 	k.person = "jonatanvalongo"  
		and k.colleague = a.colleague
		and a.recomend not in (
			select p.colleague 
			from know p 
			where p.person = "jonatanvalongo"
		)
		and a.recomend <> "jonatanvalongo"
group by a.recomend
order by valor desc
limit 15;


-- Pessoas que me conhecem que eu nao conheco
select a.person
from know a
where a.colleague = "jonatanvalongo"
	and a.person not in(
		select colleague
		from know
		where person = "jonatanvalongo");

-- pessoas desconhecidas com maior numeros de amigos em comum
select b.person, count(*) comum
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
	order by comum desc;

-- Pessoas desconhecidas com maior numero de atos culturais curtidos em comum
select b.person, count(*) comum
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
order by comum desc
limit 10;



-- Pessoas desconhecidas com maior numero de atos culturais curtidos em comum levando a nota em conta
select b.person, sum(abs(a.rating-b.rating)) Diferencas, sum(abs(a.rating-b.rating))/count(*) Diferenca_media,
		sum(5-abs(a.rating-b.rating)) Semelhancas, sum(5-abs(a.rating-b.rating))/count(*) Semelhanca_media,
		COUNT(*) Comum, sum(5-abs(a.rating-b.rating))/count(*) + 0.4*count(*) Nota
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
order by Nota desc, Comum desc
limit 20;







----- Atos Culturais
-- Atos culturais mais curtidos pelos meus amigos

select b.culturalAct Ato_recomendado, count(*) curtido_por_n_amigos
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
create view curtem as
	select culturalAct, count(*) numero
	from `like`
	group by culturalAct;


-- o 25 da divisao abaixo deve ser substituido pelo maior valor de c.numero (curtidas do ato mais curtido)
-- pois eh o responsavel pela normalizacao. Da mesma forma o peso 2 deve ser alterado experimentalmente
create view associa_ato as
select a.culturalAct Ato, b.culturalAct recomend, count(*) comum,
		c.numero curtemA, 100*count(*)/c.numero porcentagem,
		c.numero/25+2*count(*)/c.numero valor
from `like` a, `like` b, curtem c
where a.person = b.person and a.culturalAct <> b.culturalAct
		and c.culturalAct = a.culturalAct
group by a.culturalAct, b.culturalAct
having count(*) > 3 and c.numero <> count(*)
order by valor desc;



select a.recomend, MAX(a.valor) valor
from `like` l, associa_ato a
where 	l.person = "augustomorgan"  
		and l.culturalAct = a.Ato
		and a.recomend not in (
			select p.culturalAct 
			from `like` p 
			where p.person = "augustomorgan"
		)
group by a.recomend
order by valor desc
limit 15;




-- regra de associacao de 3 atos
create view curtem_ambos as
	select a.culturalAct Ato1, b.culturalAct Ato2, count(*) numero
	from `like` a, `like` b
	where 	a.person = b.person
			and a.culturalAct <> b.culturalAct
	group by a.culturalAct, b.culturalAct;

-- aqui sera criada uma view materializada (sob forma de tabela).
-- Essa view deve ser recriada esporadicamente, a cada X novas inserções na base
-- de dados. Deve ser estática para realizar a recomendação em tempo habil,
-- ja que as regras de associacao ha estarao pre-calculadas

drop table associa_2atos;
create table associa_2atos(
	Ato1 VARCHAR(50) NOT NULL,
	Ato2 VARCHAR(50) NOT NULL,
	recomend VARCHAR(50) NOT NULL,
	comum INTEGER,
	curtemAB INTEGER,
	porcentagem FLOAT,
	valor FLOAT
);

insert into associa_2atos
select a.culturalAct Ato1, b.culturalAct Ato2, c.culturalAct recomend, count(*) comum,
		d.numero curtemAB, 100*count(*)/d.numero porcentagem,
		d.numero/17+2*count(*)/d.numero valor
from `like` a, `like` b, `like` c, curtem_ambos d
where 	a.person = b.person
		and b.person = c.person
		and c.culturalAct <> b.culturalAct
		and c.culturalAct <> a.culturalAct
		and d.Ato1 = a.culturalAct
		and d.Ato2 = b.culturalAct
group by a.culturalAct, b.culturalAct, c.culturalAct
having count(*) > 4 and d.numero <> count(*)
order by valor desc;


select a.recomend, MAX(a.valor) valor
from `like` l1, `like` l2, associa_2atos a
where 	l1.person = "jonatanvalongo"
		and l2.person = l1.person
		and l1.culturalAct = a.Ato1
		and l2.culturalAct = a.Ato2
		and a.recomend not in(
				select culturalAct
				from `like`
				where person = "jonatanvalongo"
			)
group by a.recomend
order by valor desc
limit 10;






-- regra de associacao de 3 atos
create view curtem_3atos as
	select a.culturalAct Ato1, b.culturalAct Ato2, c.culturalAct Ato3, count(*) numero
	from `like` a, `like` b, `like` c
	where 	a.person = b.person
			and a.person = c.person
			and a.culturalAct <> b.culturalAct
			and a.culturalAct <> c.culturalAct
			and b.culturalAct <> c.culturalAct
	group by a.culturalAct, b.culturalAct, c.culturalAct;

-- aqui sera criada uma view materializada (sob forma de tabela).
-- Essa view deve ser recriada raramente, a cada X novas inserções na base
-- de dados. Deve ser estática para realizar a recomendação em tempo habil,
-- ja que as regras de associacao ha estarao pre-calculadas
-- Sua criação leva cerca de 45 minutos

drop table associa_3atos;
create table associa_3atos(
	Ato1 VARCHAR(50) NOT NULL,
	Ato2 VARCHAR(50) NOT NULL,
	Ato3 VARCHAR(50) NOT NULL,
	recomend VARCHAR(50) NOT NULL,
	comum INTEGER,
	curtemAB INTEGER,
	porcentagem FLOAT,
	valor FLOAT
);

				insert into associa_3atos
				select a.culturalAct Ato1, b.culturalAct Ato2, e.culturalAct Ato3, c.culturalAct recomend, count(*) comum,
						d.numero curtemABC, 100*count(*)/d.numero porcentagem,
						d.numero/17+2*count(*)/d.numero valor
				from `like` a, `like` b, `like` c, `like` e, curtem_3atos d
				where 	a.person = b.person
						and b.person = c.person
						and c.person = e.person
						and c.culturalAct <> b.culturalAct
						and c.culturalAct <> a.culturalAct
						and c.culturalAct <> e.culturalAct
						and d.Ato1 = a.culturalAct
						and d.Ato2 = b.culturalAct
						and d.Ato3 = e.culturalAct
				group by a.culturalAct, b.culturalAct, c.culturalAct
				having count(*) > 4 and d.numero <> count(*)
				order by valor desc;


				select a.recomend, MAX(a.valor) valor
				from `like` l1, `like` l2, `like` l3, associa_3atos a
				where 	l1.person = "augustomorgan"
						and l2.person = l1.person
						and l3.person = l1.person
						and l1.culturalAct = a.Ato1
						and l2.culturalAct = a.Ato2
						and l3.culturalAct = a.Ato3
						and a.recomend not in(
								select culturalAct
								from `like`
								where person = "augustomorgan"
							)
				group by a.recomend
				order by valor desc
				limit 10;




-- recomenda atos musicais similares
select s.similar recomend, count(*) numero
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
order by numero desc
limit 10;


-- recomenda atos por generos em comum
create view common_genre as
	select s1.culturalAct Ato1, s2.culturalAct Ato2, count(*) comum
	from style s1, style s2
	where 	s1.culturalAct <> s2.culturalAct
			AND s1.category = s2.category
	group by s1.culturalAct, s2.culturalAct;

select c.Ato2 recomend, AVG(comum) Media, count(*) vezes
	from common_genre c
	where 	c.Ato1 in (
				select culturalAct
				from `like`
				where person = "augustomorgan"
			)
			AND c.Ato2 not in (
				select culturalAct
				from `like`
				where person = "augustomorgan"
			)
	group by c.Ato2
	order by Media desc
	limit 10;









