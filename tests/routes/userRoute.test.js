const request = require("supertest");
const app = require("../../app"); // Adjust the path as necessary
const e = require("express");


describe("User Routes", () => {
  describe("POST /register", () => {
    it("should return 200 & the user object, including userAvatar as file upload", async () => {
      // Use .post() to hit the register endpoint
      const res = await request(app)
        .post("/auth/register")
        // Use .field() to append each form field
        .field("username", "jestexample")
        .field("email", "jest@mail.com")
        .field("password", "password")
        // Use .attach() to upload a file. The first argument is the field name ('user'), followed by the file path
        .attach("user", "../../tests/avatar.png") // Adjust "path/to/avatar.png" to the actual path of your file
        .expect(200); // Optionally, you can use .expect() to assert the status code

      // Assertions to ensure the response has the expected properties
      expect(res.body).toHaveProperty("userId");
      expect(res.body).toHaveProperty("username");
      expect(res.body).toHaveProperty("email");
      // Assuming "userAvatar" is the field where the file's reference is stored
      expect(res.body).toHaveProperty("userAvatar");
      
      // Add any other assertions as needed
    });
  });

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

 /*  // Test the GET route
  describe("GET /:userId/achievements/:achievementId/progress", () => {
    it("should return 200 & the achievement progress of the user", async () => {
      const userId = 1;
      const achievementId = 1;
      const res = await request(app).get(
        `/${userId}/achievements/${achievementId}/progress`
      );
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("progress");
    });
  });

  // Test the PUT route
  describe("PUT /:userId/achievements/:achievementId/progress", () => {
    it("should update the achievement progress of the user and return 200", async () => {
      const userId = 1;
      const achievementId = 1;
      const res = await request(app)
        .put(`/${userId}/achievements/${achievementId}/progress`)
        .send({ progress: 50 });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("progress");
    });
  }); */
});
