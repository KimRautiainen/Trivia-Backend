"use strict";
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const multer = require("multer");
const upload = multer({ dest: "uploads" });
const authorizeUser = require("../middleware/authMiddleware");
const { param } = require('express-validator');

//-------- Routes for achievement progress --------//

// Get user achievement progress
router.get(
  "/:userId/achievements/:achievementId/progress",
  [
    param('userId').isInt().withMessage('User ID must be an integer'),
    param('achievementId').isInt().withMessage('Achievement ID must be an integer'),
    authorizeUser
  ],
  userController.getUserAchievementProgress
);
// Update user achievement progress
router.put(
  "/:userId/achievements/:achievementId/progress",
  authorizeUser,
  userController.updateUserAchievementProgress
);
// Complete user achievement
router.post(
  "/:userId/achievements/:achievementId/complete",
  authorizeUser,
  userController.completeUserAchievement
);
//-------- Routes for Xp and level controlling --------//

// Add xp to user
router.route("/:userId/levels").put(authorizeUser, userController.putUserXp); 

//-------- Routes for user achievements --------//

router
  .route("/:userId/userAchievements")
  .get(authorizeUser, userController.getUserAchievements) // Get user achievements
  .post(authorizeUser, userController.postUserAchievements); // Add user achievement


// Get all achievements
router.route("/achievements").get(userController.getAllAchievements);

//-------- Routes for user --------//

router
  .route("/")
  .get(userController.getUserList) // Get all users
  .post(upload.single("user"), userController.postUser); // Add user


// Modify user
router.put(
  "/:userId",
  authorizeUser,
  upload.single("user"),
  userController.putUser
);
// Check token
router.get("/token", userController.checkToken);

// Get user by id and delete user
router
  .route("/:userId")
  .get(authorizeUser, userController.getUser)
  .delete(authorizeUser, userController.deleteUser);
// route to add correct / false answer to user
router.put("/answers/:userId", authorizeUser, userController.putUserAnswer);  

module.exports = router;
