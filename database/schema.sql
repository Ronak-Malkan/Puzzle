CREATE DATABASE puzzle;

create table if not exists users(
    id uuid primary key,
    firstName varchar not null,
    lastName varchar not null,
    email varchar(319) not null,
    password bytea not null
); 

create table if not exists blocks(
    id uuid primary key,
    userId uuid not null,
    FOREIGN KEY (userId) REFERENCES users(id) on delete cascade,
    block_type varchar not null,
    position integer not null,
    parent uuid null,
    FOREIGN KEY (parent) REFERENCES blocks(id) on delete cascade,
    properties boolean DEFAULT false,
    children boolean DEFAULT false
);

create table if not exists properties(
    id uuid primary key,
    blockId uuid not null,
    FOREIGN KEY (blockId) REFERENCES blocks(id) on delete cascade,
    property_name varchar not null,
    value varchar not null
);