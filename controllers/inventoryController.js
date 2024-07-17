"use strict"
const e = require("express");
const inventoryModel = require('../models/inventoryModel');
const validationResult = require("express-validator");

// get users inventory

const getInventory = async (req,res) => {
    try{
        const userId = req.params.userId
        const inventory = await inventoryModel.getInventory(userId);
        res.json(inventory);
    }catch(e){
        res.status(500).json({message: e.message})
    }
}

const inventoryController = {
    getInventory,
}
module.exports = inventoryController;