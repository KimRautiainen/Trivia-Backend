CREATE DATABASE triviaDb;
-- Create the User table with additional columns for experience points and level
CREATE TABLE `User`
(
  `userId` INT NOT NULL AUTO_INCREMENT,
  `firstName` TEXT NOT NULL,
  `lastName` TEXT NOT NULL,
  `email` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `userAvatar` TEXT NOT NULL,
  `password` TEXT NOT NULL,
  `experiencePoints` INT DEFAULT 0,
  `level` INT DEFAULT 1,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create the Levels table
CREATE TABLE `Level` (
  `levelId` INT NOT NULL AUTO_INCREMENT,
  `xpThreshold` INT NOT NULL,
  PRIMARY KEY (`levelId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-------------------------------------------------------------
--Achievements

-- Create the Achievements table
CREATE TABLE `Achievement` (
  `achievementId` INT NOT NULL AUTO_INCREMENT,
  `name` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `icon` TEXT,
  PRIMARY KEY (`achievementId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Create a junction table for User-Achievement relationship
CREATE TABLE `UserAchievement` (
  `userId` INT NOT NULL,
  `achievementId` INT NOT NULL,
  `dateEarned` DATETIME NOT NULL,
  PRIMARY KEY (`userId`, `achievementId`),
  FOREIGN KEY (`userId`) REFERENCES `User` (`userId`),
  FOREIGN KEY (`achievementId`) REFERENCES `Achievement` (`achievementId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


--------------------------------------------------------------