-- Lista os 15 estilos musicais mais comuns e quantos atos musicais eles possuem
select category as EstiloMusical, count(*) Quantidade from style where culturalAct in (select name from band) group by category order by count(*) desc limit 15;

-- os generos de filmes e quantos filmes eles possuem
select category as EstiloCinematográfico, count(*) Quantidade from style where culturalAct in (select name from movie) group by category order by count(*) desc limit 15;

-- lista os atos musicais que mais tem outros atos similares que foram curtidos por alguem da rede
select similar as AtoMusical, count(*) as Similares from similar group by similar order by Similares desc limit 20;

-- similar ao anterior, mas que não foram curtidos por ninguem
select similar as AtoMusical, count(*) as Similares from similar where similar not in (select culturalAct from `like`) group by similar order by Similares desc limit 20;

-- lista os paises e quantos atos musicais eles possuem
select location, count(*) as Quantidade from band where location is not NULL group by location order by Quantidade desc limit 15;

-- lista as pessoa e o desvio padrao de suas notas para dizer o quao seletivas elas sao
select person Pessoa, count(*) AtosCurtidos, std(rating) DesvioPadrao from `like` group by person order by AtosCurtidos, DesvioPadrao desc;

-- lista quantas pessoa da rede cada cidade possui
select hometown Cidade, count(*) Pessoas from person group by hometown order by Pessoas desc;

-- seleciona os atos musicais que mais tem estilos musicais em comum
select m1.name Ato1, m2.name Ato2, count(*) EstilosEmComum
from band m1, band m2, style g1, style g2
where m1.name = g1.culturalAct and m2.name = g2.culturalAct and g1.category = g2.category and m1.name <> m2.name
group by m1.name, m2.name
order by EstilosEmComum desc limit 30;

-- seleciona, entre os atos musicais curtidos, os que mais tem estilos musicais em comum
create view atosCurtidos as (
	select distinct culturalAct from `like` where culturalAct in (select name from band)
);

select m1.culturalAct Ato1, m2.culturalAct Ato2, count(*) EstilosEmComum
from atosCurtidos m1, atosCurtidos m2, style g1, style g2
where m1.culturalAct = g1.culturalAct and m2.culturalAct = g2.culturalAct and g1.category = g2.category and m1.culturalAct <> m2.culturalAct
group by m1.culturalAct, m2.culturalAct
order by EstilosEmComum desc limit 50;

-- seleciona os diretores que tem mais filmes curtidos
select director, count(*) Filmes from direct group by director order by Filmes desc limit 15;

-- seleciona os diretores mais bem avaliados
select d.director, avg(l.rating) Media, count(*) Curtidas from
	`like` l, direct d where d.movie = l.culturalAct group by director order by Curtidas desc, Media desc limit 20;


-- atores que mais tem filmes
select actor, count(*) Filmes from act group by actor order by Filmes desc limit 15;

-- atores mais bem avaliados
select a.actor, avg(l.rating) Media, count(*) Curtidas from
	`like` l, act a where a.movie = l.culturalAct group by actor order by Curtidas desc, Media desc limit 20;

-- musicos em mais bandas
select musician, count(*) Bandas from participate group by musician order by Bandas desc limit 10;

-- musicos mais bem avaliados
select p.musician, avg(l.rating) Media, count(*) Curtidas from
	`like` l, participate p where p.band = l.culturalAct group by p.musician order by Curtidas desc, Media desc limit 20;
	
	

	
	


