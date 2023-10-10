jest.mock('firebase-admin');  // This mocks the firebase admin mod
jest.mock('../src/services/authService'); 

const authService = require('../src/services/authService');
const { signIn } = require('../src/controllers/userController');

beforeEach(() => {
  jest.clearAllMocks(); /// Clears mocks before each 
});

test('should sign in successfully', async () => {
  const req = {
    body: { idToken: 'testIdToken' },
  };
  const res = {
    cookie: jest.fn(),
    status: jest.fn(() => res),
    json: jest.fn(),
  };
  const next = jest.fn();

  // Mock successful validation
  authService.validateUser.mockResolvedValue({ token: 'validToken' });

  await signIn(req, res, next);
  
  expect(res.cookie).toHaveBeenCalledWith('authToken', 'validToken', { httpOnly: true, secure: true, sameSite: 'Lax' });
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ token: 'validToken' });
});

test('should handle sign in error', async () => {
  const req = {
    body: { idToken: 'testIdToken' },
  };
  const res = {
    cookie: jest.fn(),
    status: jest.fn(() => res),
    json: jest.fn(),
  };
  const next = jest.fn();

  // Mock failed validation
  authService.validateUser.mockRejectedValue(new Error('Validation error'));

  await signIn(req, res, next);

  expect(next).toHaveBeenCalledWith(new Error('Validation error'));
});
    //Need more tests in production