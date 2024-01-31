const multer = require('multer');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Define your multer upload configuration
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    dest: 'uploads/temp/',
    fileFilter: fileFilter,
    limits: { fileSize: 3 * 1024 * 1024 } // 3MB
}).single('user');

// Middleware function
const handleUserUpdate = (req, res, next) => {
    upload(req, res, function (uploadError) {
        if (uploadError) {
            return res.status(400).json({ message: uploadError.message });
        }
        next();
    });
};

module.exports = handleUserUpdate;