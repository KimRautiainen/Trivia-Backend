"use strict";
const pool = require("../Db");
const promisePool = pool.promise();

// get inventory for user

const getInventory = async (userId) => {
  try {
    const sql = `
        SELECT * FROM Inventory WHERE userId = ?
        `;
    const [rows] = await promisePool.query(sql, [userId]);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new error("sql query failed");
  }
};
module.exports = {
  getInventory,
};
