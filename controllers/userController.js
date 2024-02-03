"use strict";
const e = require("express");
const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const multer = require("multer");
const fs = require('fs');
const path = require('path');

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/png', 'image/jpeg']
  if (allowedTypes.includes(file.mimetype)) {
      // accept file
      cb(null, true);
  }else {
      // reject file
      cb(null, false);
  }
};

// Get all users
const getUserList = async (req, res) => {
  try {
    const users = await userModel.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by id
const getUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) {
    res.status(400).json({
      location: "userController, getUser",
      error: 500,
      message: "invalid id",
    });
    return;
  }

  const [user] = await userModel.getUserById(userId);
  console.log("getUser", user);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found." });
  }
};

// Create new user

const postUser = async (req, res) => {
  console.log("posting user", req.body, req.file);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Check if username is already taken
  const usernameExists = await userModel.checkUsername(req.body.username);
  if (usernameExists.length > 0) {
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/', req.file.filename);
      fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
      });
  }
    return res.status(409).json({ message: "Username already taken" });
  }

  // Check if email is already in use
  const emailExists = await userModel.checkEmail(req.body.email);
  if (emailExists.length > 0) {
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/', req.file.filename);
      fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
      });
  }
    return res.status(409).json({ message: "Email already in use" });
  }

  // Generate a salt with bcrypt
  const salt = await bcrypt.genSalt(10);
  // Hash the user's password using bcrypt and the generated salt
  const password = await bcrypt.hash(req.body.password, salt);

  // Create a new user object with the hashed password and other user details
  const newUser = {
    username: req.body.username,
    email: req.body.email,
    filename: req.file.filename,
    password: password,
    experiencePoints: 0,
    level: 1,
    maxXp: 100,
  };

  try {
    // Insert the new user into the database
    const result = await userModel.insertUser(newUser);
    res.status(201).json({ message: "User created" });
  } catch (error) {
    console.error("error", error.message);
    res.status(500).json({
      error: 500,
      message: error.message,
    });
  }
};

// Modify user
const putUser = async (req, res) => {
  console.log("Request Body:", req.body); // Log the request body

  const errors = validationResult(req);
  console.log("Validation Errors:", errors.array()); // Log validation errors

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
      const userId = req.params.userId;
      if (!userId) {
          deleteUploadedFile(req);
          return res.status(400).json({ message: "User ID is required" });
      }

      const userUpdates = {};

      if (req.body.password) {
          const salt = await bcrypt.genSalt(10);
          userUpdates.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatableFields = ["username", "email"];
      updatableFields.forEach((field) => {
          if (req.body[field]) {
              userUpdates[field] = req.body[field];
          }
      });

      if (req.file) {
          // Move file from temp to permanent directory
          const tempPath = req.file.path;
          const targetPath = path.join(__dirname, '../uploads/', req.file.filename);
          
          await moveFile(tempPath, targetPath);
          userUpdates.userAvatar = req.file.filename;
      } else if (req.body.sessionuser) {
          userUpdates.userAvatar = req.body.sessionuser;
      }

      if (Object.keys(userUpdates).length === 0) {
          deleteUploadedFile(req);
          return res.status(400).json({ message: "No updates provided" });
      }

      const result = await userModel.modifyUser(userId, userUpdates);
      res.status(200).json({ message: "User modified" });
  } catch (error) {
      console.error(error);
      deleteUploadedFile(req);
      res.status(500).json({ message: "Internal server error" });
  }
};

function deleteUploadedFile(req) {
  if (req.file) {
      const filePath = path.join(__dirname, '../uploads/temp/', req.file.filename);
      fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
      });
  }
}

async function moveFile(source, destination) {
  return new Promise((resolve, reject) => {
      fs.rename(source, destination, (err) => {
          if (err) {
              console.error("Error moving file:", err);
              reject(err);
          } else {
              resolve();
          }
      });
  });
}

// Delete user
const deleteUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const result = await userModel.deleteUser(req.params.userId);
    console.log(req.params);
    console.log(req.params.userId);
    res.status(200).json({ message: "User deleted" });
  } catch (e) {
    console.error("error", e.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Check token
const checkToken = (req, res) => {
  res.json({ user: req.user });
};
const checkUsername = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const username = req.query.username;
    const result = await userModel.checkUsername(username);
    res.status(200).json({ available: result.length === 0 });
  } catch (error) {
    console.error("error", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

const checkEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const email = req.query.email;
    const result = await userModel.checkEmail(email);
    res.status(200).json({ available: result.length === 0 });
  } catch (error) {
    console.error("error", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// User level controlling

const getUserLevel = async (req, res) => {};
const putUserLevel = async (req, res) => {};
// Add xp to user
const putUserXp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const result = await userModel.addUserXp(req.params.userId, req.body.xp);
    console.log("userId from req.params: ", req.params.userId);
    console.log("xp from req.body: ", req.body.xp);

    res.status(200).json({ message: "Xp added" });
  } catch (e) {
    console.error("error", e.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
// User achievements controlling

// Shows all achievents that can be earned
const getAllAchievements = async (req, res) => {
  try {
    const achievements = await userModel.getAllAchievements();
    res.json(achievements);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message });
  }
};

// Show users earned achievements
const getUserAchievements = async (req, res) => {
  const userId = Number(req.params.userId);
  if (!Number.isInteger(userId)) {
    res.status(400).json({ error: 500, message: "invalid id" });
    return;
  } else {
    try {
      const achievements = await userModel.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

// Add achievement to user
const postUserAchievements = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const achievementId = req.body.achievementId;
  const userId = req.params.userId;
  // Basic validation
  if (!userId || !achievementId) {
    res.status(400).json({ message: "Missing userId or achievementId" });
    return;
  }

  try {
    const result = await userModel.insertUserAchievement(userId, achievementId);
    res.status(201).json({ message: "Achievement added successfully", result });
  } catch (error) {
    console.error("Error in insertUserAchievementController", error.message);
    res.status(500).json({ message: "Error adding achievement" });
  }
};

// Achievement progress controlling

// Get progress of a specific achievement
const getUserAchievementProgress = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Assuming validation is successful, proceed with the original logic
    const userId = req.params.userId;
    const achievementId = req.params.achievementId;
    const progress = await userModel.getAchievementProgress(userId, achievementId);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update progress of a specific achievement
const updateUserAchievementProgress = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.params.userId;
    const achievementId = req.params.achievementId;
    const { progress } = req.body;
    const result = await userModel.updateAchievementProgress(
      userId,
      achievementId,
      progress
    );
    res.status(200).json({ message: "Progress updated successfully", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete a specific achievement
const completeUserAchievement = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const userId = req.params.userId; 
    const achievementId = req.params.achievementId; 
    const result = await userModel.completeAchievement(userId, achievementId);
    res
      .status(200)
      .json({ message: "Achievement completed successfully", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// add correct / false answer to user
const putUserAnswer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const userId = req.params.userId;
    const correct = req.body.correct;
    const falseAnswers = req.body.falseAnswers;
    const result = await userModel.putUserAnswer(userId, correct, falseAnswers);
    res.status(200).json({ message: "Answer added" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const userController = {
  getUserList,
  getUser,
  postUser,
  putUser,
  deleteUser,
  checkToken,
  putUserXp,
  getUserAchievements,
  getAllAchievements,
  postUserAchievements,
  getUserAchievementProgress,
  updateUserAchievementProgress,
  completeUserAchievement,
  checkUsername,
  checkEmail,
  putUserAnswer,
};
module.exports = userController;
