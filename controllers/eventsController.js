const Event = require('../models/eventsModel');

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.getAllEvents();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
};

const getEventById = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await Event.getEventById(eventId);
    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ error: 'Event not found.' });
    }
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event.' });
  }
};

const createEvent = async (req, res) => {
  const eventData = req.body;
  try {
    const eventId = await Event.createEvent(eventData);
    res.status(201).json({ message: 'Event created successfully.', eventId });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event.' });
  }
};

const updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const eventData = req.body;
  try {
    const updated = await Event.updateEvent(eventId, eventData);
    if (updated) {
      res.json({ message: 'Event updated successfully.' });
    } else {
      res.status(404).json({ error: 'Event not found.' });
    }
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event.' });
  }
};

const deleteEvent = async (req, res) => {
  const { eventId } = req.params;
  try {
    const deleted = await Event.deleteEvent(eventId);
    if (deleted) {
      res.json({ message: 'Event deleted successfully.' });
    } else {
      res.status(404).json({ error: 'Event not found.' });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
};

const getEligibleEvents = async (req, res) => {
  const { rankLevel, tournamentTickets } = req.query; // Expecting these values in query params
  try {
    const events = await Event.getEligibleEvents(rankLevel, tournamentTickets);
    res.json(events);
  } catch (error) {
    console.error('Error fetching eligible events:', error);
    res.status(500).json({ error: 'Failed to fetch eligible events.' });
  }
};

const joinEvent = async (req, res) => {
  const { eventId, userId } = req.body;
  try {
    const joined = await Event.joinEvent(eventId, userId);
    if (joined) {
      res.json({ message: 'Successfully joined the event.' });
    } else {
      res.status(404).json({ error: 'Event not found.' });
    }
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({ error: 'Failed to join event.' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEligibleEvents,
  joinEvent,
};
