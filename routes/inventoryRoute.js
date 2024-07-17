"use strict";
const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const authorizeUser = require("../middleware/authMiddleware");
const { param, body, validationResult } = require("express-validator");

//// validation for user id
const validatedUserId = param("userId")
  .isInt()
  .withMessage("User ID must be an integer");

// get users inventory
router.get(
  "/items/:userId",
  [validatedUserId],
  inventoryController.getInventory
);

// add items to inventory
router.put("/add/:userId", [validatedUserId], inventoryController.addItem);

// deduct item from inventory
router.put()

module.exports = router;
