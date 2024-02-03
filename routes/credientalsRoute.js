"use strict";
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { query } = require("express-validator");

// Validate username format
router.get("/username", [
    query('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isAlphanumeric().withMessage('Username must be alphanumeric')
      .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    userController.checkUsername
  ]);
  
  // Validate email format
  router.get("/email", [
    query('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    userController.checkEmail
  ]);

module.exports = router;
