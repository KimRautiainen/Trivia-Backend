"use strict";
const pool = require("../Db");
const promisePool = pool.promise();

const getAllUsers = async () => {
  try {
    const sql = `
      SELECT 
        userId, 
        username, 
        userAvatar, 
        experiencePoints, 
        level, 
        maxXp, 
        totalCorrectAnswers, 
        totalFalseAnswers 
      FROM User
    `;
    const [rows] = await promisePool.query(sql);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("SQL query failed");
  }
};

const getUserById = async (id) => {
  try {
    const sql = `
    SELECT 
      userId, 
      username, 
      userAvatar, 
      experiencePoints, 
      level, 
      maxXp, 
      totalCorrectAnswers, 
      totalFalseAnswers 
    FROM User where userId=?
  `;
    const [rows] = await promisePool.query(sql, [id]);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql query failed");
  }
};
const checkUsername = async (username) => {
  try {
    const sql = `SELECT * FROM User WHERE username = ?`;
    const [rows] = await promisePool.query(sql, [username]);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql query failed");
  }
};
const checkEmail = async (email) => {
  try {
    const sql = `SELECT * FROM User WHERE email = ?`;
    const [rows] = await promisePool.query(sql, [email]);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql query failed");
  }
};

const insertUser = async (user) => {
  const connection = await promisePool.getConnection();
  await connection.beginTransaction();

  try {
    // Insert user
    const sqlInsertUser = `INSERT INTO User (username, email, userAvatar, password, experiencePoints, level, maxXp) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [userResult] = await connection.query(sqlInsertUser, [
      user.username,
      user.email,
      user.filename,
      user.password,
      user.experiencePoints,
      user.level,
      user.maxXp,
    ]);

    const userId = userResult.insertId;

    // Insert default inventory for the user
    const sqlInsertInventory = `INSERT INTO Inventory (userId, goldCoins, tournamentTickets, otherItems) VALUES (?, ?, ?, ?)`;
    await connection.query(sqlInsertInventory, [
      userId,
      0, // default value for goldCoins
      0, // default value for tournamentTickets
      JSON.stringify({}), // default value for otherItems
    ]);

    await connection.commit();
    return userResult;
  } catch (e) {
    await connection.rollback();
    console.error("error", e.message);
    throw new Error("sql insert user failed");
  } finally {
    connection.release();
  }
};

const modifyUser = async (userId, userUpdates) => {
  try {
    // Start with the base SQL query
    let sql = "UPDATE User SET ";
    const params = [];

    // Dynamically add fields to the SQL query
    Object.keys(userUpdates).forEach((key, index, array) => {
      sql += `${key}=?`;
      sql += index < array.length - 1 ? ", " : " "; // Add a comma between fields, but not after the last field
      params.push(userUpdates[key]);
    });

    // Add the WHERE clause to target the specific user
    sql += "WHERE userId = ?";
    params.push(userId);

    console.log(sql);

    // Execute the query
    const [rows] = await promisePool.query(sql, params);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("SQL update user failed");
  }
};

const deleteUser = async (id) => {
  try {
    const sql = `DELETE FROM User where userId=?`;
    const [rows] = await promisePool.query(sql, [id]);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql delete user failed");
  }
};

const getUserLogin = async (email) => {
  try {
    console.log(email);
    const [rows] = await promisePool.execute(
      "SELECT * FROM User WHERE email = ?;",
      [email]
    );
    console.log("get user login rows", rows);
    return rows;
  } catch (e) {
    console.log("error", e.message);
  }
};

// User Level Models

const getUserLevel = async (userId) => {
  try {
    const sql = `SELECT level FROM User WHERE userId=?`;
    const [rows] = await promisePool.query(sql, [userId]);
    return rows[0];
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql query failed");
  }
};

// add experience points to user and check if user level up
const addUserXp = async (userId, xp) => {
  try {
    const sql = `UPDATE User SET experiencePoints=experiencePoints+? where userId=?`;
    const [rows] = await promisePool.query(sql, [xp, userId]);
    checkLevelUp(userId);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql update user xp failed");
  }
};

// check if user level up and update user level, maxXP and XP
const checkLevelUp = async (userId) => {
  try {
    console.log("checkLevelUp: ");
    const sqlQuery = `SELECT experiencePoints, level, maxXp FROM User WHERE userId=?`;
    const [rows] = await promisePool.query(sqlQuery, [userId]);
    let row = rows[0];

    while (row.experiencePoints >= row.maxXp) {
      row.experiencePoints -= row.maxXp; // Subtract maxXp from current experience points
      row.level += 1; // Increase level
      row.maxXp *= 1.5; // increase maxXp by 50%
    }

    const sqlUpdate = `UPDATE User SET level=?, maxXp=?, experiencePoints=? WHERE userId=?`;
    const [updateRows] = await promisePool.query(sqlUpdate, [
      row.level,
      row.maxXp,
      row.experiencePoints,
      userId,
    ]);

    return updateRows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql query failed");
  }
};

// Achievement Models

// get all achievements
const getAllAchievements = async () => {
  try {
    const sql = `SELECT * FROM Achievement`;
    const [rows] = await promisePool.query(sql);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql query failed");
  }
};

const getUserAchievements = async (userId) => {
  try {
    const sql = `
      SELECT a.*, ap.progress, ap.isCompleted
      FROM Achievement a
      LEFT JOIN AchievementProgress ap ON a.achievementId = ap.achievementId AND ap.userId = ?
      ORDER BY ap.isCompleted, a.achievementId`;
    const [rows] = await promisePool.query(sql, [userId]);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql query failed");
  }
};

const insertUserAchievement = async (userId, achievementId) => {
  try {
    const sql = `INSERT INTO UserAchievement (userId, achievementId, dateEarned) VALUES (?, ?, NOW())`;
    const [rows] = await promisePool.query(sql, [userId, achievementId]);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql query failed");
  }
};

const getAchievementProgress = async (userId, achievementId) => {
  const sql = `SELECT * FROM AchievementProgress WHERE userId = ? AND achievementId = ?`;
  const [rows] = await promisePool.query(sql, [userId, achievementId]);
  return rows[0];
};

const updateAchievementProgress = async (userId, achievementId, progress) => {
  const sql = `INSERT INTO AchievementProgress (userId, achievementId, progress)
               VALUES (?, ?, ?)
               ON DUPLICATE KEY UPDATE progress = ?`;
  await promisePool.query(sql, [userId, achievementId, progress, progress]);
  await checkAndAwardAchievements(userId, achievementId); // Check if the achievement is completed after updating progress
};

const completeAchievement = async (userId, achievementId) => {
  const sql = `UPDATE AchievementProgress SET isCompleted = TRUE WHERE userId = ? AND achievementId = ?`;
  const [result] = await promisePool.query(sql, [userId, achievementId]);
  await insertUserAchievement(userId, achievementId); // Automatically insert the completed achievement
  return result;
};

const checkAndAwardAchievements = async (userId, achievementId) => {
  try {
    const sql = `SELECT * FROM Achievement WHERE achievementId = ?`;
    const [achievementRows] = await promisePool.query(sql, [achievementId]);
    if (achievementRows.length === 0) {
      throw new Error("Achievement not found");
    }
    const achievement = achievementRows[0];

    const progress = await getAchievementProgress(userId, achievementId);
    if (progress.progress >= achievement.requirement && !progress.isCompleted) {
      await completeAchievement(userId, achievementId);
    }
  } catch (e) {
    console.error("error", e.message);
    throw new Error("failed to check and award achievements");
  }
};

// add correct and false answers to User
const putUserAnswer = async (userId, correct, falseAnswer) => {
  try {
    const sql = `UPDATE User SET totalCorrectAnswers=totalCorrectAnswers+?, totalFalseAnswers=totalFalseAnswers+? where userId=?`;
    const [rows] = await promisePool.query(sql, [correct, falseAnswer, userId]);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql update user answers failed");
  }
};
// add user rank points and check if user rank up
const putUserRank = async (userId, rankPoints) => {
  try {
    const sql = `UPDATE User SET rankPoints=rankPoints+? where userId=?`;
    const [rows] = await promisePool.query(sql, [rankPoints, userId]);
    return rows;
  } catch (e) {
    console.error("error", e.message);
    throw new Error("sql update user rank points failed");
  }
};
// check for user rank levelup on rankpoints

module.exports = {
  getAllUsers,
  getUserById,
  insertUser,
  modifyUser,
  deleteUser,
  getUserLogin,
  addUserXp,
  checkLevelUp,
  getUserLevel,
  getAllAchievements,
  getUserAchievements,
  insertUserAchievement,
  getAchievementProgress,
  updateAchievementProgress,
  completeAchievement,
  checkUsername,
  checkEmail,
  putUserAnswer,
  putUserRank,
};
