-- create schema socialIC;
-- create schema social;
drop schema social;
create schema social;
use social;

create table `location`(
	`name`       varchar(50) NOT NULL,
	`type`       varchar(10) NOT NULL,
	`parent`     varchar(10) NULL,
	foreign key(`parent`)
		references `location`(`name`)
		on delete cascade
		on update cascade,
	primary key(`name`)
);

create table `person`(
	`uri`        varchar(50) NOT NULL,
	`name`       varchar(50) NOT NULL,
	`hometown`   varchar(50) NOT NULL,
	foreign key(`hometown`)
		references `location`(`name`)
		on delete cascade
		on update cascade,
	primary key(`uri`)
);

create table `know`(
	`person`     varchar(50) NOT NULL,
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

create table `cultural_act`(
	`name`       varchar(50) NOT NULL,
	primary key(`name`)
);

create table `band`(
	`name`       varchar(50) NOT NULL,
	`location`	 varchar(50) NOT NULL,
	foreign key(`name`)
		references `cultural_act`(`name`)
		on delete cascade
		on update cascade,
	foreign key(`location`)
		references `location`(`name`)
		on delete cascade
		on update cascade,
	primary key(`name`)
);

create table `movie`(
	`name`       varchar(50) NOT NULL,
	`plot`       varchar(50) NOT NULL,
	`IMDBrating` int NOT NULL,
	`IMDBvotes`  int NOT NULL,
	foreign key(`name`)
		references `cultural_act`(`name`)
		on delete cascade
		on update cascade,
	primary key(`name`)
);

create table `director`(
	`name`       varchar(50) NOT NULL,
	primary key(`name`)
);

create table `actor`(
	`name`       varchar(50) NOT NULL,
	primary key(`name`)
);

create table `category`(
	`name`       varchar(50) NOT NULL,
	primary key(`name`)
);

create table `musician`(
	`name`       varchar(50) NOT NULL,
	primary key(`name`)
);

create table `direct`(
	`director`   varchar(50) NOT NULL,
	`movie`      varchar(50) NOT NULL,
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
	`actor`      varchar(50) NOT NULL,
	`movie`      varchar(50) NOT NULL,
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
	`category`     varchar(50) NOT NULL,
	`cultural_act` varchar(50) NOT NULL,
	foreign key(`category`)
		references `category`(`name`)
		on delete cascade
		on update cascade,
	foreign key(`cultural_act`)
		references `cultural_act`(`name`)
		on delete cascade
		on update cascade,
	primary key(`category`, `cultural_act`)
);

create table `participate`(
	`musician`   varchar(50) NOT NULL,
	`band`       varchar(50) NOT NULL,
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
	`person`       varchar(50) NOT NULL,
	`cultural_act` varchar(50) NOT NULL,
	`rating`       int NOT NULL,
	foreign key(`person`)
		references `person`(`uri`)
		on delete cascade
		on update cascade,
	foreign key(`cultural_act`)
		references `cultural_act`(`name`)
		on delete cascade
		on update cascade,
	primary key(`person`, `cultural_act`)
);