const request = require("supertest");
const app = require("../../app"); // Adjust the path as necessary
const e = require("express");
const path = require('path');

// Test cases for auth routes

describe("Auth Routes", () => {
  // Test for user login
  describe("POST /login", () => {
    it("should return 200 & the user object", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "testi@testaaja.com", password: "12345" });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
    });
  });
});

// Test cases for credientals routes
describe("Credientals Routes", () => {
  // Test for username availability with username that is available
  describe("GET /username", () => {
    it("should return 200 & a message if the username is available", async () => {
      const res = await request(app)
        .get("/check/username")
        .query({ username: "jestexampletest" })
        .expect(200);
      expect(res.body).toEqual({ available: true });
    });
  });
  // Test for email availability with email that is available
  describe("GET /email", () => {
    it("should return 200 & a message if the email is available", async () => {
      const res = await request(app)
        .get("/check/email")
        .query({ email: "jest@testExample.com" })
        .expect(200);
      expect(res.body).toEqual({ available: true });
    });
  });

  // Test for username availability with username that is not available
  describe("GET /username", () => {
    it("should return 200 & a message if the username is not available", async () => {
      const res = await request(app)
        .get("/check/username")
        .query({ username: "testi" })
        .expect(200);
      expect(res.body).toEqual({ available: false });
    });
  });
  // Test for email availability with email that is not available
  describe("GET /email", () => {
    it("should return 200 & a message if the email is not available", async () => {
      const res = await request(app)
        .get("/check/email")
        .query({ email: "testi@testaaja.com" })
        .expect(200);
      expect(res.body).toEqual({ available: false });
    });
  });
});

// Test cases for leaderboard routes
describe("Leaderboard Routes", () => {
  // Test for getting leaderboard
  describe("GET /getLeaderboard", () => {
    it("should return 200 & an array of objects", async () => {
      const res = await request(app).get("/leaderboard/getLeaderboard");
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
  // Test for getting leaderboard by id
  describe("GET /getLeaderboardById/:userId", () => {
    it("should return 200 & an array of objects", async () => {
      const res = await request(app).get("/leaderboard/getLeaderboardById/1");
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
  // Test for getting highscore
  describe("GET /getHighscore/:userId", () => {
    it("should return 200 & an object", async () => {
      const res = await request(app).get("/leaderboard/getHighscore/1");
      expect(res.statusCode).toEqual(200);
      expect(typeof res.body).toBe("object");
    });
  });
});

// Test cases that require authentication
describe("Integrated Tests with Auth", () => {
  let token;

  // Perform login and set token
  beforeAll(async () => {
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "testi@testaaja.com", password: "12345" });
    expect(loginRes.statusCode).toEqual(200);
    expect(loginRes.body).toHaveProperty("token");
    token = loginRes.body.token; // Store the token for future requests
  });

  // Test for updating users highscore
  describe("PUT /updateHighscore/:userId", () => {
    it("should return 200 & an object", async () => {
      const res = await request(app)
        .put("/leaderboard/updateHighscore/1")
        .send({ gameId: 1, score: 100 })
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(typeof res.body).toBe("object");
    });
  });
  // Test for getting user achievement progress
  describe("GET /:userId/achievements/:achievementId/progress", () => {
    it("should return 200 & an object", async () => {
      const res = await request(app)
        .get("/user/1/achievements/2/progress")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(typeof res.body).toBe("object");
      expect(res.body).toHaveProperty("progress");
    });
  });
  // Test for updating user achievement progress
  describe("PUT /:userId/achievements/:achievementId/progress", () => {
    it("should return 200 & an object", async () => {
      const res = await request(app)
        .put("/user/1/achievements/2/progress")
        .send({ progress: 50 })
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(typeof res.body).toBe("object");
      expect(res.body.message).toEqual("Progress updated successfully");
    });
  });
  // Test for completing user achievement
  describe("POST /:userId/achievements/:achievementId/complete", () => {
    it("should return 200 & an object", async () => {
      const res = await request(app)
        .post("/user/1/achievements/2/complete")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(typeof res.body).toBe("object");
      expect(res.body.message).toEqual("Achievement completed successfully");
    });
  });
  // Test for adding xp to user
  describe("PUT /:userId/levels", () => {
    it("should return 200 & an object", async () => {
      const res = await request(app)
        .put("/user/1/levels")
        .send({ xp: 100 })
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(typeof res.body).toBe("object");
      expect(res.body.message).toEqual("Xp added");
    });
  });
  // Test for getting user achievements
  describe("GET /:userId/userAchievements", () => {
    it("should return 200 & an array of objects", async () => {
      const res = await request(app)
        .get("/user/1/userAchievements")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
  // Test for adding achievement to user
 /*  describe("POST /:userId/userAchievements", () => {
    it("should return 200 & an object", async () => {
      const res = await request(app)
        .post("/user/1/userAchievements")
        .send({ achievementId: 2 })
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(201);
      expect(typeof res.body).toBe("object");
      expect(res.body.message).toEqual("Achievement added successfully");
    });
  }); */
  // test for getting all achievements
  describe("GET /user/achievements", () => {
    it("should return 200 & an array of objects", async () => {
      const res = await request(app)
        .get("/user/achievements")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
  // Test for gettil all users
  describe("GET /users", () => {
    it("should return 200 & an array of objects", async () => {
      const res = await request(app)
        .get("/user/")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
  // Test for modifying user
  describe("PUT /user/:userId", () => {
    it("should return 200 & an object", async () => {
      const res = await request(app)
        .put("/user/1")
        .send({ username: "testi" })
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(typeof res.body).toBe("object");
      expect(res.body.message).toEqual("User modified");
    });
  });
  // Test for check token
  describe("GET /checkToken", () => {
    it("should return 200 & an object", async () => {
      const res = await request(app)
        .get("/user/token")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(typeof res.body).toBe("object");
      expect(res.body.user[0].userId).toEqual(1);
    });
  });
  // Test for getting user by id
  describe("GET /user/:userId", () => {
    it("should return 200 & an object", async () => {
      const res = await request(app)
        .get("/user/1")
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(typeof res.body).toBe("object");
      expect(res.body.userId).toEqual(1);
    });
  });
  // Test for adding correct / false answer to user
  describe("PUT /user/answers/:userId", () => {
    it("should return 200 & an object", async () => {
      const res = await request(app)
        .put("/user/answers/1")
        .send({ correct: 1 })
        .set("Authorization", `Bearer ${token}`);
      expect(res.statusCode).toEqual(200);
      expect(typeof res.body).toBe("object");
      expect(res.body.message).toEqual("Answer added");
    });
  });
 
});
// Test cases for user lifecycle management (create, login, delete)
describe('User lifecycle management', () => {
  let newUserEmail = 'newUserTest@example.com';
  let newUserPassword = 'password123';
  let token;
  let userId;

  // Step 1: Create the user with profile picture
  it('should create a user with a profile picture', async () => {
    const userProfilePicturePath = path.join(__dirname, '..', 'avatar.png'); // Adjust the path as needed
    const createResponse = await request(app)
      .post('/auth/register') // Adjust this to your user creation endpoint
      .field('username', 'newUserTest')
      .field('email', newUserEmail)
      .field('password', newUserPassword)
      .attach('user', userProfilePicturePath)
      .expect(201) // Assuming 201 is the success status code for user creation
      
  });

  // Step 2: Log in with the newly created user
  it('should log in the newly created user and return a token', async () => {
    const loginResponse = await request(app)
      .post('/auth/login') // Adjust this to your login endpoint
      .send({
        email: newUserEmail,
        password: newUserPassword,
      })
      .expect(200); // Assuming 200 is the success status code for login

    token = loginResponse.body.token; // Save token for deletion
    userId = loginResponse.body.user.userId; // Save userId for deletion
  });

  // Optional: Additional tests using the token can be placed here

  it('should delete the user', async () => {
    // Use the `userId` and `token` to delete the user
    await request(app)
      .delete(`/user/${userId}`) // Adjust this to your user deletion endpoint
      .set('Authorization', `Bearer ${token}`)
      .expect(200); // Assuming 200 is the success status code for deletion
  });
});
