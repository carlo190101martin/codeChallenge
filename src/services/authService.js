const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const serviceAccount = require(process.env.FIREBASE_KEY_PATH);
//always use env variable

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  
});

const db = admin.firestore();

const assignRandomScore = () => {
    const minScore = 1;
    const maxScore = 100;
    return Math.floor(Math.random() * (maxScore - minScore + 1)) + minScore;
  };


  const createUserProfile = async (uid, email) => {
    try {
        // Data you want to store for the user
        const userProfile = {
            email: email,
            score: assignRandomScore(),
            team: null  // or a default team if you have one
        };
        
        // Store the data in Firestore
        await db.collection('users').doc(uid).set(userProfile);
        
    } catch (error) {
        console.error('Error creating user profile:', error);
    }
};

async function createUser(email, password) {
  try {
    const userRecord = await admin.auth().createUser({ email, password });
    await createUserProfile(userRecord.uid, email);
    // Generate a JWT with user UID and email and send it back to the client
    const token = jwt.sign({ uid: userRecord.uid, email: userRecord.email }, process.env.secret);
    return { token };
  } catch (error) {
    throw error;
  }
}

async function validateUser(idToken) {
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const token = jwt.sign({ uid: decodedToken.uid, email: decodedToken.email }, process.env.secret);
        return { token };
    } catch (error) {
        throw error;
    }
}
async function deleteTeam(req, res, next) {
  try {
      const { teamId } = req.params;
      
      // Fetch the team from the database and validate if needed
      const teamDoc = await db.collection('teams').doc(teamId).get();
      if(!teamDoc.exists) {
          return res.status(404).json({ message: 'Team not found' });
      }

      // Delete the team
      await db.collection('teams').doc(teamId).delete();
      
      // Send a success response
      res.status(200).json({ message: 'Team successfully deleted' });
  } catch (error) {
      console.error('Error deleting team:', error);
      next(error); // Pass error to express error handler
  }
}
let authService;

if (process.env.NODE_ENV === 'test') {
  // Jest's functions will be in global
  authService = {
    validateUser: jest.fn(),
  };
} else {
  authService = {
    validateUser: (user) => {
    },
  };
}


module.exports = {
  createUser,
  validateUser,
  authService,
  db,
  admin,
};