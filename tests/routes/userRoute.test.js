const request = require("supertest");
const app = require("../../app"); // Adjust the path as necessary
const e = require("express");

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
