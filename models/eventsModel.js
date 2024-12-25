"use strict";
const pool = require("../Db");
const promisePool = pool.promise();


const Event = {
  getAllEvents: async () => {
    const [results] = await promisePool.query('SELECT * FROM Events WHERE isActive = TRUE');
    return results;
  },

  getEventById: async (eventId) => {
    const [results] = await promisePool.query('SELECT * FROM Events WHERE eventId = ?', [eventId]);
    return results[0];
  },

  createEvent: async (eventData) => {
    const [results] = await promisePool.query('INSERT INTO Events SET ?', [eventData]);
    return results.insertId;
  },

  updateEvent: async (eventId, eventData) => {
    const [results] = await promisePool.query('UPDATE Events SET ? WHERE eventId = ?', [eventData, eventId]);
    return results.affectedRows;
  },

  deleteEvent: async (eventId) => {
    const [results] = await promisePool.query('DELETE FROM Events WHERE eventId = ?', [eventId]);
    return results.affectedRows;
  },

  getEligibleEvents: async (rankLevel, tournamentTickets) => {
    const [results] = await promisePool.query(
      'SELECT * FROM Events WHERE requiredRankLevel <= ? AND entryCost <= ? AND isActive = TRUE',
      [rankLevel, tournamentTickets]
    );
    return results;
  },

  joinEvent: async (eventId) => {
    const [results] = await promisePool.query(
      'UPDATE Events SET currentParticipants = currentParticipants + 1 WHERE eventId = ?',
      [eventId]
    );
    return results.affectedRows;
  },
};

module.exports = Event;