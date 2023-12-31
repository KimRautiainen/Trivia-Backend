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
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create the Levels table --
CREATE TABLE `Level` (
  `levelId` INT NOT NULL AUTO_INCREMENT,
  `xpThreshold` INT NOT NULL,
  PRIMARY KEY (`levelId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-------------------------------------------------------------
--Achievements--

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

-- insert some achievements to database --
INSERT INTO Achievement (name, description, icon, requirement) VALUES
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
--------------------------------------------------------------

