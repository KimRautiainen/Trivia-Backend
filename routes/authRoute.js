"use strict";
const express = require("express");
const router = express.Router();
const {body} = require('express-validator');
const { login, logout } = require("../controllers/authController");
const {postUser} = require('../controllers/userController');
const handleUserUpload = require('../middleware/uploadMiddleware');



router.post("/login", login);

router.get('/logout', logout);

router.post('/register', handleUserUpload, postUser);

module.exports = router;