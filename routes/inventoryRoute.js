const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

router.post("/add", inventoryController.addItems);
router.post("/deduct", inventoryController.deductItems);
router.get("/getInventory", inventoryController.getInventory);

module.exports = router;
