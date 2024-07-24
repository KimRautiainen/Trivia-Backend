const { Op } = require("sequelize");
const Friends = require("../models/friendsModel");
const FriendRequests = require("../models/friendRequestsModel");
const sequelize = require("../sequelize");
const userModel = require("../models/userModel");

// send friend request
const sendFriendRequest = async (req, res) => {
  const requesterId = req.user[0].userId;
  const recipientId = req.params.recipientId;

  try {
    await FriendRequests.create({ requesterId, recipientId });
    res.status(200).json({ message: "Friend request sent succesfully" });
  } catch (error) {
    console.error("error sendind friend request");
    res.status(500).json({ message: "Internal server error" });
  }
};

// accept or deny friend request
const respondFriendRequest = async (req, res) => {
  const requesterId = req.user[0].userId;
  const recipientId = req.params.recipientId;
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  try {
    const request = await FriendRequests.findOne({
      where: { requesterId, recipientId, status: "pending" },
    });
    if (!request) {
      return res.status(400).json({ message: "Friend request not found" });
    }
    request.status = status;
    request.dateResponded = new Date();
    await request.save();

    if (status === "accepted") {
      await Friends.create({ userId: requesterId, friendId: recipientId });
      await Friends.create({ userId: recipientId, friendId: requesterId });
    }

    res.status(200).json({ message: `Freind request ${status}` });
  } catch (error) {
    console.error("error responding to friend request", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get pending friend requests
const getPendingFriendRequests = async (req, res) => {
  const userId = req.user[0].userId;

  try {
    const [requests] = await sequelize.query(
      `
      SELECT fr.requesterId, fr.recipientId, fr.status, fr.dateRequested, u.username, u.email, u.userAvatar
      FROM FriendRequests fr
      JOIN User u ON fr.requesterId = u.userId
      WHERE fr.recipientId = ? AND fr.status = 'pending'
      `,
      {
        replacements: [userId],
      }
    );

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching pending friend requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add friend
const addFriend = async (req, res) => {
  const userId = req.user[0].userId;
  const friendId = req.params.friendId;

  try {
    await Friends.create({ userId, friendId });
    await Friends.create({ userId: friendId, friendId: userId });
    res.status(200).json({ message: "Friend added succesfully" });
  } catch (error) {
    console.error("Error adding friend:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// remove friend
const removeFriend = async (req, res) => {
  const userId = req.user[0].userId;
  const friendId = req.params.friendId;

  try {
    await Friends.destroy({
      where: {
        [Op.or]: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });
    res.status(200).json({ message: "Friend removed succesfully" });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get users friends
const getUsersFriends = async (req, res) => {
  const userId = req.user[0].userId;
  try {
    const friends = await Friends.findAll({
      where: {
        userId,
      },
      include: {
        model: userModel,
        attributes: ["userId", "username", "email", "userAvatar"],
        as: "friendDetails",
        through: { attributes: [] },
      },
    });
    res.status(200).json(friends.map((friend) => friend.friendDetails));
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  sendFriendRequest,
  respondFriendRequest,
  getPendingFriendRequests,
  addFriend,
  removeFriend,
  getUsersFriends,
};
