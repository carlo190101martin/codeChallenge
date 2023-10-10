const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { db } = require('../services/authService');

//general note for actual production should use https to prevent man in the middle attack
async function authMiddleware(req, res, next) {

  try {
    const token = req.cookies.authToken;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = jwt.verify(token, process.env.secret);
        //always use environmental variables.  



    // verify if the user exists in your Firebase Auth users.
    const userSnapshot = await admin.auth().getUser(decodedToken.uid);
    
    if (!userSnapshot) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user to the request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

async function teamOwnerMiddleware(req, res, next) {
  try {
      const { teamId } = req.params;
      const teamSnapshot = await db.collection('teams').doc(teamId).get();
      
      if (!teamSnapshot.exists) {
          return res.status(404).json({ error: 'Team not found' });
      }
      
      const team = teamSnapshot.data();
      if (team.owner !== req.user.uid) {
          return res.status(403).json({ error: 'User is not the team owner' });
      }
      
      next();
  } catch (error) {
      console.error('Error verifying team ownership:', error);
      next(error);
  }
}
//review above for removal when time


module.exports = {
  authMiddleware,
  teamOwnerMiddleware,
};
