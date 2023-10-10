const authService = require('../services/authService');

async function signUp(req, res, next) {
  try {
    const { email, password } = req.body;
    const { token } = await authService.createUser(email, password);
    console.log('Generated Token:', token);
    res.status(201).json({ token });
  } catch (error) {
    console.error("Sign Up Error:", error);
    if (error.code && error.code.includes('auth/')) {
      return res.status(400).json({ message: 'Sign Up Failed: ' + error.message });
    }
    next(error);
  }
}

async function signIn(req, res, next) {
    try {
        const { idToken } = req.body;  // retrieve idToken, not email/password
        const { token } = await authService.validateUser(idToken); // validate using idToken
        res.cookie('authToken', token, { httpOnly: true, secure: true, sameSite: 'Lax' });
        res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
}

module.exports = {
  signUp,
  signIn,
};