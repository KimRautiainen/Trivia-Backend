const express = require("express");
const router = express.Router();
const friendsController = require("../controllers/friendsController");

// send friend request
router.post("/requestFriend/:recipientId", friendsController.sendFriendRequest);

// respond to friend request
router.post(
  "/respondFriend/:recipientId",
  friendsController.respondFriendRequest
);

// get pending friend requests
router.get("/pendingRequests", friendsController.getPendingFriendRequests);

// remove friend
router.delete("/deleteFriend/:friendId", friendsController.removeFriend);

// get users friends
router.get("/getFriends", friendsController.getUsersFriends);

module.exports = router;