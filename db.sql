CREATE DATABASE IF NOT EXISTS api_data_hub;
DROP DATABASE IF EXISTS api_data_hub;

USE api_data_hub;

CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value TEXT NOT NULL
);

INSERT INTO properties (name, value) VALUES ('version', '1.0.0');
