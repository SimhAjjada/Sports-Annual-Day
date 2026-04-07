


SET FOREIGN_KEY_CHECKS = 0;


DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS team_players;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS sports;

SET FOREIGN_KEY_CHECKS = 1;

CREATE DATABASE IF NOT EXISTS sports_dashboard;
USE sports_dashboard;


CREATE TABLE sports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);


CREATE TABLE participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  sport_id INT,
  FOREIGN KEY (sport_id) REFERENCES sports(id)
);

CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  sport_id INT,
  FOREIGN KEY (sport_id) REFERENCES sports(id)
);

CREATE TABLE team_players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT,
  participant_id INT,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (participant_id) REFERENCES participants(id)
);


CREATE TABLE matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sport_id INT,
  team1_id INT,
  team2_id INT,
  winner_id INT NULL,
  FOREIGN KEY (sport_id) REFERENCES sports(id)
);


CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  event_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE event_sports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  sport_id INT NOT NULL,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (sport_id) REFERENCES sports(id),
  UNIQUE KEY unique_event_sport (event_id, sport_id)
);


ALTER TABLE participants
ADD COLUMN event_id INT NULL,
ADD FOREIGN KEY (event_id) REFERENCES events(id);

ALTER TABLE matches
ADD COLUMN round INT DEFAULT 1;

ALTER TABLE matches
ADD COLUMN event_id INT;

ALTER TABLE matches
ADD COLUMN status ENUM('pending','ongoing','completed') DEFAULT 'pending';

ALTER TABLE matches
ADD COLUMN bye_player_id INT NULL;

ALTER TABLE events
ADD COLUMN tournament_locked BOOLEAN DEFAULT FALSE;

INSERT INTO events (name, description, event_date)
VALUES 
('Annual Day 2026', 'Main Annual Sports Event', '2026-03-15');



INSERT INTO sports (name) VALUES
('Cricket'),
('Badminton'),
('Table Tennis');

INSERT INTO event_sports (event_id, sport_id)
VALUES
(1, 1), -- Cricket
(1, 2), -- Badminton
(1, 3); -- Table Tennis

INSERT INTO event_sports (event_id, sport_id)
VALUES
(2, 1), -- Cricket
(2, 2), -- Badminton
(2, 3); -- Table Tennis




SELECT id, sport_id, round, winner_id 
FROM matches 
WHERE sport_id = 2;


SELECT * FROM event_sports;

SELECT * FROM matches;

SELECT * FROM teams;

SELECT * FROM participants;

SELECT id, winner_id FROM matches ORDER BY id DESC;

SELECT * FROM matches ORDER BY id DESC;

SELECT * FROM event_sports;

SELECT * FROM event_sports WHERE event_id = 2;

SELECT id, name, event_id FROM participants;

DESCRIBE participants;

SELECT * FROM events;

SELECT * FROM sports;
