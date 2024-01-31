"use strict";
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const multer = require("multer");
const upload = multer({ dest: "uploads" });
const authorizeUser = require("../middleware/authMiddleware");
const { param, body } = require("express-validator");
const handleUserUpdate = require("../middleware/handleUserUpdate");

// validation for user id and achievement id
const validatedUserId = param("userId")
  .isInt()
  .withMessage("User ID must be an integer");
const validatedAchievementId = param("achievementId")
  .isInt()
  .withMessage("Achievement ID must be an integer");

//-------- Routes for achievement progress --------//

// Get user achievement progress
router.get(
  "/:userId/achievements/:achievementId/progress",
  [validatedUserId, validatedAchievementId, authorizeUser],
  userController.getUserAchievementProgress
);
// Update user achievement progress
router.put(
  "/:userId/achievements/:achievementId/progress",
  [
    validatedUserId,
    validatedAchievementId,
    body("progress")
      .isInt({ min: 0 })
      .withMessage("Progress must be an integer"),
    authorizeUser,
  ],
  userController.updateUserAchievementProgress
);
// Complete user achievement
router.post(
  "/:userId/achievements/:achievementId/complete",
  [validatedUserId, validatedAchievementId, authorizeUser],
  userController.completeUserAchievement
);
//-------- Routes for Xp and level controlling --------//

// Add xp to user
router
  .route("/:userId/levels")
  .put(
    [
      validatedUserId,
      body("xp").isInt({ min: 0 }).withMessage("XP must be an integer"),
      authorizeUser,
    ],
    userController.putUserXp
  );

//-------- Routes for user achievements --------//

router
  .route("/:userId/userAchievements")
  // Get users earned achievements
  .get([validatedUserId, authorizeUser], userController.getUserAchievements) 

  // Add achievement to user
  .post(
    [
      validatedUserId,
      body("achievementId")
        .isInt()
        .withMessage("Achievement ID must be an integer"),
      authorizeUser,
    ],
    userController.postUserAchievements
  ); 

// Get all achievements
router.route("/achievements").get(userController.getAllAchievements);

//-------- Routes for user --------//

router
  .route("/")
  .get(userController.getUserList) // Get all users
  //.post(upload.single("user"), userController.postUser); // Add user

// Modify user
router.put(
  "/:userId",
  authorizeUser,
  handleUserUpdate,
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
