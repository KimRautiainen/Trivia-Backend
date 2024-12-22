const express = require('express');
const eventsController = require('../controllers/eventsController');

const router = express.Router();

router.get('/', eventsController.getAllEvents);
router.get('/:eventId', eventsController.getEventById);
router.post('/', eventsController.createEvent);
router.put('/:eventId', eventsController.updateEvent);
router.delete('/:eventId', eventsController.deleteEvent);
router.get('/eligible', eventsController.getEligibleEvents);
router.post('/join', eventsController.joinEvent);

module.exports = router;
