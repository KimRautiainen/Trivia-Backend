"use strict"
const express = require("express");
const router = express.Router();
const questionsController = require("../controllers/questionsController");
const authorizeUser = require("../middleware/authMiddleware");
const {param, body, validationResult} = require("express-validator");

// validation for user id
const validatedUserId = param("userId")
  .isInt()
  .withMessage("User ID must be an integer");

const validatedTournamentTag = param("tournamentTag")
    .isString()
    .withMessage("tournamentTag must be a string")

// get questions with tournament tag
router.get("/questions/:tournamentTag", [validatedTournamentTag], questionsController.getQuestionsWithTournamentTag)


module.exports = router;