const request = require('supertest');
const app = require('../../app'); // Adjust the path as necessary

describe('E2E Testing for User Routes', () => {
  it('GET /users should return all users', async () => {
    const response = await request(app)
      .get('/users')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toBeInstanceOf(Array);
    // Additional assertions as needed
  });
});