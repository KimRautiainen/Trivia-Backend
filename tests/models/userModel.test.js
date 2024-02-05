// userModel.test.js
const userModel = require('../../models/userModel');
// Assuming you're using a mock DB or a mocking library for DB calls

// Test the getAllUsers function
describe('getAllUsers', () => {
  it('should return all users', async () => {
    // database mock of of all users
    //const mockUsers = [{ id: 1, name: 'John Doe', email: 'john.doe@mail.com',}];

    const users = await userModel.getAllUsers();
    expect(users).toBeInstanceOf(Array);
  });
});
