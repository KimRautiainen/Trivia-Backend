const authorizeUser = (req, res, next) => {
  const loggedInUserId = req.user[0].userId; // ID from authenticated user
  const requestedUserId = req.params.userId; // ID from the request parameters
  console.log(req.user);
  console.log(
    `Logged in user ID: ${loggedInUserId}, Requested user ID: ${requestedUserId}`
  );

  if (loggedInUserId.toString() !== requestedUserId.toString()) {
    return res.status(403).json({ message: "Access Denied!" });
  }
  next();
};
module.exports = authorizeUser;
