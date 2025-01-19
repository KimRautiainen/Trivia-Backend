const multer = require("multer");
const { validationResult, body } = require("express-validator");

// multer upload configuration

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg"];
  if (allowedTypes.includes(file.mimetype)) {
    // accept file
    cb(null, true);
  } else {
    // reject file
    cb(null, false);
  }
};

const upload = multer({
  dest: "uploads/",
  fileFilter: fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
}).single("user");

// Middleware function
const handleUserUpload = (req, res, next) => {
  upload(req, res, function (uploadError) {
    if (uploadError) {
      return res.status(400).json({ message: uploadError.message });
    }

    // Perform validation checks here after multer has parsed the data
    const validationChecks = [
      body("username")
        .trim()
        .escape()
        .isLength({ min: 3, max: 20 })
        .withMessage("Username must be at least 3 characters long"),
      body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
      body("password")
        .isLength({ min: 5, max: 30 })
        .withMessage("Password must be at least 5 characters long"),
    ];

    // Run the validations
    for (let check of validationChecks) {
      check(req, res, () => {});
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  });
};

module.exports = handleUserUpload;
