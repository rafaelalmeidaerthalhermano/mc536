-- create schema socialIC;
-- create schema social;
drop schema social;
create schema social;
use social;

create table `country`(
	`name` varchar(50) NOT NULL,
	primary key(`name`)
);

create table `city`(
	`name` varchar(50) NOT NULL,
	`country` varchar(10) NOT NULL,
	foreign key(`country`)
		references `country`(`name`)
		on delete cascade
		on update cascade,
	primary key(`name`)
);

create table `person`(
	`uri` varchar(50) NOT NULL,
	`name` varchar(50) NOT NULL,
	`hometown` varchar(50) NULL,
	foreign key(`hometown`)
		references `city`(`name`)
		on delete cascade
		on update cascade,
	primary key(`uri`)
);

create table `know`(
	`person` varchar(50) NOT NULL,
	`colleague`  varchar(50) NOT NULL,
	foreign key(`person`)
		references `person`(`uri`)
		on delete cascade
		on update cascade,
	foreign key(`colleague`)
		references `person`(`uri`)
		on delete cascade
		on update cascade,
	primary key(`person`, `colleague`)
);

create table `culturalAct`(
	`name` varchar(50) NOT NULL,
	primary key(`name`)
);

create table `band`(
	`name` varchar(50) NOT NULL,
	`location` varchar(50) NULL,
	foreign key(`name`)
		references `culturalAct`(`name`)
		on delete cascade
		on update cascade,
	foreign key(`location`)
		references `country`(`name`)
		on delete cascade
		on update cascade,
	primary key(`name`)
);

create table `similar`(
	`band` varchar(50) NOT NULL,
	`similar` varchar(50) NOT NULL,
	foreign key(`band`)
		references `band`(`name`)
		on delete cascade
		on update cascade,
	foreign key(`similar`)
		references `band`(`name`)
		on delete cascade
		on update cascade,
	primary key(`band`,`similar`)
);
create table `movie`(
	`name` varchar(50) NOT NULL,
	`plot` varchar(500) NOT NULL,
	`IMDBrating` float NOT NULL,
	`IMDBvotes` int NOT NULL,
	foreign key(`name`)
		references `culturalAct`(`name`)
		on delete cascade
		on update cascade,
	primary key(`name`)
);

create table `director`(
	`name` varchar(50) NOT NULL,
	primary key(`name`)
);

create table `actor`(
	`name` varchar(50) NOT NULL,
	primary key(`name`)
);

create table `category`(
	`name` varchar(50) NOT NULL,
	primary key(`name`)
);

create table `musician`(
	`name` varchar(50) NOT NULL,
	primary key(`name`)
);

create table `direct`(
	`director` varchar(50) NOT NULL,
	`movie` varchar(50) NOT NULL,
	foreign key(`director`)
		references `director`(`name`)
		on delete cascade
		on update cascade,
	foreign key(`movie`)
		references `movie`(`name`)
		on delete cascade
		on update cascade,
	primary key(`director`, `movie`)
);

create table `act`(
	`actor` varchar(50) NOT NULL,
	`movie` varchar(50) NOT NULL,
	foreign key(`actor`)
		references `actor`(`name`)
		on delete cascade
		on update cascade,
	foreign key(`movie`)
		references `movie`(`name`)
		on delete cascade
		on update cascade,
	primary key(`actor`, `movie`)
);

create table `style`(
	`category` varchar(50) NOT NULL,
	`culturalAct` varchar(50) NOT NULL,
	foreign key(`category`)
		references `category`(`name`)
		on delete cascade
		on update cascade,
	foreign key(`culturalAct`)
		references `culturalAct`(`name`)
		on delete cascade
		on update cascade,
	primary key(`category`, `culturalAct`)
);

create table `participate`(
	`musician` varchar(50) NOT NULL,
	`band` varchar(50) NOT NULL,
	foreign key(`musician`)
		references `musician`(`name`)
		on delete cascade
		on update cascade,
	foreign key(`band`)
		references `band`(`name`)
		on delete cascade
		on update cascade,
	primary key(`musician`, `band`)
);

create table `like`(
	`person` varchar(50) NOT NULL,
	`culturalAct` varchar(50) NOT NULL,
	`rating` int NOT NULL,
	foreign key(`person`)
		references `person`(`uri`)
		on delete cascade
		on update cascade,
	foreign key(`culturalAct`)
		references `culturalAct`(`name`)
		on delete cascade
		on update cascade,
	primary key(`person`, `culturalAct`)
);