
const { getUserList } = require('../../controllers/userController');
const userModel = require('../../models/userModel');

jest.mock('../../models/userModel'); // Mock the userModel

// Test the getUserList function
describe('getUserList', () => {
  it('should fetch a list of users', async () => {
    userModel.getAllUsers.mockResolvedValue([{ id: 1, name: 'John Doe' }]); // Mock the response
    const users = await getUserList();
    expect(users).toEqual([{ id: 1, name: 'John Doe' }]);
  });
});
