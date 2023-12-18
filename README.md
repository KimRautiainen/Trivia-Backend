Application Overview
Application is built on Node.js with Express and uses MySQL for data storage. It's structured into controllers, routes, and models, adhering to the MVC (Model-View-Controller) architecture pattern.

Key Components
Controllers (userController): Contains logic for handling requests and sending responses.
Routes: Define the URL patterns and HTTP methods for different endpoints.
Models: Interact with the MySQL database, executing SQL queries and returning results.
Controllers and Endpoints
User Management

GET /user: Retrieves a list of all users.
GET /user/:userId: Retrieves a specific user by userId.
POST /user: Creates a new user. Expects user details in the request body.
PUT /user: Updates an existing user. Expects user details and userId in the request body.
DELETE /user/:userId: Deletes a specific user by userId.
User Levels and Experience Points

PUT /user/:userId/levels: Updates the experience points of a user and checks for level up. Expects xp in the request body.
Achievements

GET /user/achievements: Retrieves all available achievements.
GET /user/:userId/userAchievements: Retrieves achievements earned by a specific user.
POST /user/:userId/userAchievements: Awards a specific achievement to a user. Expects achievementId in the request body.
Models and Database Interaction
User Management

getAllUsers: Fetches all users from the database.
getUserById: Fetches a specific user by userId.
insertUser: Inserts a new user into the database.
modifyUser: Updates an existing user in the database.
deleteUser: Deletes a user from the database.
User Levels and Experience Points

addUserXp: Adds experience points to a user and checks for level up.
checkLevelUp: Checks if the user's experience points exceed the threshold for a level up and updates the user's level.
Achievements

getAllAchievements: Fetches all achievements from the database.
getUserAchievements: Fetches achievements earned by a specific user.
insertUserAchievement: Inserts a record into UserAchievement when a user earns an achievement.
Security and Authentication
The application uses JWT (JSON Web Tokens) for authentication, as indicated in the route middleware (passport.authenticate('jwt', {session: false})).
Middleware
CORS Middleware: Allows cross-origin requests.
Body Parsing Middleware: Parses incoming request bodies (JSON and URL-encoded).
Static Middleware: Serves static files from the /uploads directory.
Logging Middleware: Logs request details (method and path).
Error Handling
Each controller function includes try-catch blocks for error handling, sending appropriate HTTP status codes and error messages in response to exceptions.
Testing
Testing can be performed using tools like Postman for API endpoint testing and unit testing frameworks like Mocha or Jest for backend logic.
Notes
Ensure all user inputs are validated and sanitized to prevent security vulnerabilities like SQL injection.
Regularly review and update dependencies to maintain security and performance.
This documentation provides an overview of your application's structure and functionality. Keep it updated as you make changes or add new features to your application.





