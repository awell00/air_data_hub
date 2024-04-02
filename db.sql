DROP DATABASE IF EXISTS air_data_hub;
CREATE DATABASE IF NOT EXISTS air_data_hub;

USE air_data_hub;

CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL
);

INSERT INTO properties (name, value) VALUES ('version', '2.0.0');
