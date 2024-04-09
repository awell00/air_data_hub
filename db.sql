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
-- Inserting cities
INSERT INTO cities(name, lat, lon) VALUES ('Lyon', 45.75, 4.85);
INSERT INTO cities(name, lat, lon) VALUES ('Marseille', 43.296482, 5.36978);
INSERT INTO cities(name, lat, lon) VALUES ('Toulouse', 43.604652, 1.444209);
INSERT INTO cities(name, lat, lon) VALUES ('Nice', 43.7034, 7.2663);

INSERT INTO gaz(name, idCity, ppm) VALUES ('NH3', 4, 0.5);
INSERT INTO gaz(name, idCity, ppm) VALUES ('CO2', 4, 34.5);

INSERT INTO gaz(name, idCity, ppm) VALUES ('NH3', 5, 2.005);
INSERT INTO gaz(name, idCity, ppm) VALUES ('CO2', 5, 0.5);

INSERT INTO gaz(name, idCity, ppm) VALUES ('NH3', 6, 0.005);
INSERT INTO gaz(name, idCity, ppm) VALUES ('CO2', 6, 4.5);

INSERT INTO gaz(name, idCity, ppm) VALUES ('NH3', 7, 0.005);
INSERT INTO gaz(name, idCity, ppm) VALUES ('CO2', 7, 0.5);

insert into gaz(name, idCity, ppm) VALUES ('NH3', 1, 0.005);
insert into gaz(name, idCity, ppm) VALUES ('CO2', 1, 0.15);

insert into gaz(name, idCity, ppm) VALUES ('H2O', 2, 800);
