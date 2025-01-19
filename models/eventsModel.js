"use strict";
const pool = require("../Db");
const promisePool = pool.promise();

// Models for events
const Event = {

  // Get all events from database that are active
  getAllEvents: async () => {
    const [results] = await promisePool.query(
      "SELECT * FROM Events WHERE isActive = TRUE"
    );
    return results;
  },

  //get event with event Id
  getEventById: async (eventId) => {
    const [results] = await promisePool.query(
      "SELECT * FROM Events WHERE eventId = ?",
      [eventId]
    );
    return results[0];
  },

  // Create a new event to database
  createEvent: async (eventData) => {
    const [results] = await promisePool.query("INSERT INTO Events SET ?", [
      eventData,
    ]);
    return results.insertId;
  },

  // Update event
  updateEvent: async (eventId, eventData) => {
    const [results] = await promisePool.query(
      "UPDATE Events SET ? WHERE eventId = ?",
      [eventData, eventId]
    );
    return results.affectedRows;
  },
  // Delete event
  deleteEvent: async (eventId) => {
    const [results] = await promisePool.query(
      "DELETE FROM Events WHERE eventId = ?",
      [eventId]
    );
    return results.affectedRows;
  },

  // Get events from database where user is egilible to join
  getEligibleEvents: async (rankLevel, tournamentTickets) => {
    const [results] = await promisePool.query(
      "SELECT * FROM Events WHERE requiredRankLevel <= ? AND entryCost <= ? AND isActive = TRUE",
      [rankLevel, tournamentTickets]
    );
    return results;
  },

  // Update event tables current participants
  joinEvent: async (eventId) => {
    const [results] = await promisePool.query(
      "UPDATE Events SET currentParticipants = currentParticipants + 1 WHERE eventId = ?",
      [eventId]
    );
    return results.affectedRows;
  },
};

module.exports = Event;
