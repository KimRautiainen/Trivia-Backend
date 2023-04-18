'use strict';
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require("multer");
const upload = multer({dest: 'uploads'});


router.route('/')
    .get( userController.getUserList)
    .post(upload.single('user'),userController.postUser)
    .put(userController.putUser)

router.route('/:userId')
    .get(userController.getUser)
    .delete(userController.deleteUser)


module.exports = router;