DROP DATABASE IF EXISTS triviaDb;
CREATE DATABASE triviaDb;
USE triviaDb;

-- Create the User table with additional columns for experience points and level --
CREATE TABLE `User`
(
  `userId` INT NOT NULL AUTO_INCREMENT,
  `username` TEXT NOT NULL,
  `email` TEXT NOT NULL,
  `userAvatar` TEXT NOT NULL,
  `password` TEXT NOT NULL,
  `experiencePoints` INT DEFAULT 0,
  `level` INT DEFAULT 1,
  `maxXp` INT DEFAULT 100,
  `totalCorrectAnswers` INT DEFAULT 0,
  `totalFalseAnswers` INT DEFAULT 0,
  `rankPoints` INT DEFAULT 0,
  `rankLevel` INT DEFAULT 1,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create the Levels table --
CREATE TABLE `Level` (
  `levelId` INT NOT NULL AUTO_INCREMENT,
  `xpThreshold` INT NOT NULL,
  PRIMARY KEY (`levelId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Achievements --

-- Create the Achievements table --
CREATE TABLE `Achievement` (
  `achievementId` INT NOT NULL AUTO_INCREMENT,
  `name` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `icon` TEXT,
  `requirement` INT NOT NULL,
  PRIMARY KEY (`achievementId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create a junction table for User-Achievement relationship --
CREATE TABLE `UserAchievement` (
  `userId` INT NOT NULL,
  `achievementId` INT NOT NULL,
  `dateEarned` DATETIME NOT NULL,
  PRIMARY KEY (`userId`, `achievementId`),
  FOREIGN KEY (`userId`) REFERENCES `User` (`userId`),
  FOREIGN KEY (`achievementId`) REFERENCES `Achievement` (`achievementId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Insert some achievements into the database --
INSERT INTO `Achievement` (name, description, icon, requirement) VALUES
  ('Trivia Novice', 'Awarded for completing 10 trivia games.', 'icon_url_novice', 10),
  ('Trivia Expert', 'Awarded for scoring over 80% in a trivia game.', 'icon_url_expert', 80),
  ('Quiz Master', 'Awarded for winning 5 trivia games in a row.', 'icon_url_master', 5),
  ('Participation Star', 'Awarded for participating in a trivia game every day for a week.', 'icon_url_star', 7),
  ('Eagle Eye', 'Awarded for achieving a perfect score in a trivia game.', 'icon_url_eagle', 10);

-- Table for tracking progress towards achievements --
CREATE TABLE `AchievementProgress` (
  `userId` INT NOT NULL,
  `achievementId` INT NOT NULL,
  `progress` INT DEFAULT 0,
  `isCompleted` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (`userId`, `achievementId`),
  FOREIGN KEY (`userId`) REFERENCES `User` (`userId`),
  FOREIGN KEY (`achievementId`) REFERENCES `Achievement` (`achievementId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create the Rank table --
CREATE TABLE `Rank` (
  `rankLevel` INT NOT NULL,
  `minPoints` INT NOT NULL,
  `maxPoints` INT NOT NULL,
  PRIMARY KEY (`rankLevel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Insert rank levels and point ranges
INSERT INTO `Rank` (rankLevel, minPoints, maxPoints) VALUES
(1, 0, 999),
(2, 1000, 1999),
(3, 2000, 2999);

-- Create the Leaderboard table --
CREATE TABLE `Leaderboard` (
  `leaderboardId` INT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `score` INT NOT NULL,
  `rankingDate` DATE NOT NULL,
  `gameId` INT NOT NULL,
  PRIMARY KEY (`leaderboardId`),
  FOREIGN KEY (`userId`) REFERENCES `User` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Insert users into the User table
INSERT INTO User (username, email, userAvatar, password) VALUES 
('user1', 'user1@example.com', 'avatar1.png', 'hashedpassword1'),
('user2', 'user2@example.com', 'avatar2.png', 'hashedpassword2'),
('user3', 'user3@example.com', 'avatar3.png', 'hashedpassword3'),
('user4', 'user4@example.com', 'avatar4.png', 'hashedpassword4'),
('user5', 'user5@example.com', 'avatar5.png', 'hashedpassword5');

-- Insert data into the Leaderboard table
INSERT INTO Leaderboard (userId, score, rankingDate, gameId) VALUES
(1, 150, '2022-03-01', 1),
(2, 125, '2022-03-01', 1),
(3, 100, '2022-03-01', 1),
(4, 75,  '2022-03-01', 1),
(5, 50,  '2022-03-01', 1),
(1, 200, '2022-03-08', 2),
(2, 175, '2022-03-08', 2),
(3, 150, '2022-03-08', 2),
(4, 100, '2022-03-08', 2),
(5, 80,  '2022-03-08', 2);

-- Create tournament questions table

CREATE TABLE `Questions` (
  `questionId` INT NOT NULL AUTO_INCREMENT,
  `question` TEXT NOT NULL,
  `category` VARCHAR(255) NOT NULL,
  `answerOptions` JSON NOT NULL,
  `correctAnswer` TEXT NOT NULL,
  `tag` VARCHAR(255) NOT NULL, 
  `difficulty` VARCHAR(50) NOT NULL,
  `regions` TEXT,
  `type` VARCHAR(50) NOT NULL DEFAULT "text_choice",
  PRIMARY KEY (`questionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- associate specific sets of questions with specific tournaments
ALTER TABLE `Questions`
ADD `tournamentTag` VARCHAR(255) NOT NULL DEFAULT 'general';

INSERT INTO Questions (question, category, answerOptions, correctAnswer, tag, difficulty, regions, type) VALUES
('What is the capital of France?', 'Geography', JSON_ARRAY('Paris', 'Berlin', 'Madrid', 'Rome'), 'Paris', 'Europe', 'Easy', 'Western Europe', 'text_choice');

INSERT INTO Questions (question, category, answerOptions, correctAnswer, tag, difficulty, regions, type) VALUES
('Which planet is known as the Red Planet?', 'Science', JSON_ARRAY('Mars', 'Venus', 'Jupiter', 'Saturn'), 'Mars', 'Space', 'Medium', 'Solar System', 'text_choice');

INSERT INTO Questions (question, category, answerOptions, correctAnswer, tag, difficulty, regions, type) VALUES
('Who wrote "To Kill a Mockingbird"?', 'Literature', JSON_ARRAY('Harper Lee', 'Mark Twain', 'F. Scott Fitzgerald', 'Ernest Hemingway'), 'Harper Lee', 'Books', 'Medium', 'USA', 'text_choice');

INSERT INTO Questions (question, category, answerOptions, correctAnswer, tag, difficulty, regions, type) VALUES
('What is the chemical symbol for gold?', 'Science', JSON_ARRAY('Au', 'Ag', 'Pb', 'Fe'), 'Au', 'Elements', 'Hard', 'Periodic Table', 'text_choice');
