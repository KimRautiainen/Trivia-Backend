const Event = require("../models/eventsModel");

// Get all events from database
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.getAllEvents();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events." });
  }
};

// get event by event id from database
const getEventById = async (req, res) => {
  const { eventId } = req.params; // get event id from request parameters
  try {
    const event = await Event.getEventById(eventId);
    if (event) {
      res.json(event); // if event exist send response
    } else {
      res.status(404).json({ error: "Event not found." }); // notify if event does not exist
    }
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Failed to fetch event." });
  }
};

// Create event
const createEvent = async (req, res) => {
  const eventData = req.body; // Take event data from req.body
  // Try to create event and handle error case
  try {
    const eventId = await Event.createEvent(eventData);
    res.status(201).json({ message: "Event created successfully.", eventId });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to create event." });
  }
};

// Modify an existing event
const updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const eventData = req.body;
  // Update event and handle error if something goes wrong
  try {
    const updated = await Event.updateEvent(eventId, eventData);
    if (updated) {
      res.json({ message: "Event updated successfully." });
    } else {
      res.status(404).json({ error: "Event not found." });
    }
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event." });
  }
};

// Delete existing event
const deleteEvent = async (req, res) => {
  const { eventId } = req.params;
  try {
    const deleted = await Event.deleteEvent(eventId);
    if (deleted) {
      res.json({ message: "Event deleted successfully." });
    } else {
      res.status(404).json({ error: "Event not found." });
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event." });
  }
};

// -- Event might have rank requirements or other requirements -- //

// get all events where user can join from database
const getEligibleEvents = async (req, res) => {
  const { rankLevel, tournamentTickets } = req.query; // Expecting these values in query params
  try {
    const events = await Event.getEligibleEvents(rankLevel, tournamentTickets);
    res.json(events);
  } catch (error) {
    console.error("Error fetching eligible events:", error);
    res.status(500).json({ error: "Failed to fetch eligible events." });
  }
};

// Join event
const joinEvent = async (req, res) => {
  const { eventId, userId } = req.body;
  try {
    const joined = await Event.joinEvent(eventId, userId);
    if (joined) {
      res.json({ message: "Successfully joined the event." });
    } else {
      res.status(404).json({ error: "Event not found." });
    }
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({ error: "Failed to join event." });
  }
};

// Export all controllers
module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEligibleEvents,
  joinEvent,
};
