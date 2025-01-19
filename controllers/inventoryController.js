const Inventory = require("../models/inventoryModel");
const sequelize = require("../sequelize");

// get inventory for user with user id
exports.getInventory = async (req, res) => {
  const userId = req.user[0].userId; // Get userId from authenticated user

  try {
    const inventory = await Inventory.findOne({ where: { userId } }); // Find inventory for user of the userId

    if (!inventory) {
      return res.status(404).json({ message: "user inventory not found" }); // handle if it inventory doesnt exist
    }
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json({ message: "server error", errror: error.message });
  }
};

// Add items to inventory
exports.addItems = async (req, res) => {
  const { goldCoins = 0, tournamentTickets = 0 } = req.body;
  const userId = req.user[0].userId; // Get userId from authenticated user

  const transaction = await sequelize.transaction(); // Use sequelizes transaction

  // get the inventory
  try {
    const inventory = await Inventory.findOne(
      { where: { userId } },
      { transaction }
    );

    // Handle if inventory doesnt exist and abort transaction
    if (!inventory) {
      await transaction.rollback();
      return res.status(404).json({ message: "User Inventory not found" }); // Send response
    }

    inventory.goldCoins += parseInt(goldCoins, 10); // Ensure goldCoins is treated as integer
    inventory.tournamentTickets += parseInt(tournamentTickets, 10); // Ensure tournamentTickets is treated as integer

    // Save inventory changes
    await inventory.save({ transaction });

    // Commit inventory changes
    await transaction.commit();

    res.status(200).json({ message: "Items added successfully", inventory });
  } catch (error) {
    await transaction.rollback(); // If error occurs rollback changes
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Deduct items from inventory
exports.deductItems = async (req, res) => {
  const { goldCoins = 0, tournamentTickets = 0 } = req.body;
  const userId = req.user[0].userId;

  const transaction = await sequelize.transaction();

  // get inventory
  try {
    const inventory = await Inventory.findOne(
      { where: { userId } },
      { transaction }
    );

    // Handle if inventory doesnt exist
    if (!inventory) {
      await transaction.rollback();
      return res.status(404).json({ message: "User Inventory not found" });
    }
    // Check if the deducted amount is greater than whats in inventory currently
    if (
      inventory.goldCoins < goldCoins ||
      inventory.tournamentTickets < tournamentTickets
    ) {
      await transaction.rollback(); // Rollback changes
      return res.status(400).json({ message: "Not enough items to deduct" });
    }

    inventory.goldCoins -= parseInt(goldCoins, 10); // Ensure goldCoins is treated as integer
    inventory.tournamentTickets -= parseInt(tournamentTickets, 10); // Ensure tournamentTickets is treated as integer

    // Save inventory changes
    await inventory.save({ transaction });

    // commit changes
    await transaction.commit();

    res.status(200).json({ message: "Items deducted successfully", inventory });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
