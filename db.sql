DROP DATABASE IF EXISTS air_data_hub;
CREATE DATABASE IF NOT EXISTS air_data_hub;

USE air_data_hub;

CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL
);

create table cities (
    id SERIAL primary key,
    name varchar(50),
    lat float,
    lon float
);

create table gaz (
    id SERIAL primary key,
    name varchar(50),
    ppm float,
    idCity BIGINT unsigned,
    foreign key (idCity) references cities(id)
);

INSERT INTO properties (name, value) VALUES ('version', '3.0.0');

insert into cities(name, lat, lon) VALUES ('Rennes', 48.112,-1.67429);
insert into cities(name, lat, lon) VALUES ('Paris', 48.8647,2.34901);
insert into cities(name, lat, lon) VALUES ('Bordeaux', 44.836151, -0.580816);

insert into gaz(name, idCity, ppm) VALUES ('NH3', 2, 0.005);
insert into gaz(name, idCity, ppm) VALUES ('CO2', 2, 0.5);
insert into gaz(name, idCity, ppm) VALUES ('H2O', 2, 800);
