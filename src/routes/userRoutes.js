const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const jwt = require('jsonwebtoken');


router.post('/signup', userController.signUp);
router.post('/signin', userController.signIn);
router.get('/current-user', (req, res) => {
    console.log('Accessing /current-user endpoint'); 
    try {
        // Extract token from cookie
        const token = req.cookies.authToken;

        // Verify JWT and extract user ID
        const payload = jwt.verify(token, process.env.secret);
        console.log('Decoded Payload:', payload); //

        // Send user ID in response
        res.json({ userId: payload.uid });
    } catch (error) {
        res.status(401).json({ error: 'Unable to authenticate user' });
    }
});

module.exports = router;