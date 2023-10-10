require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');
const { authMiddleware } = require('./middleware/authMiddleware.js');
const { body, validationResult } = require('express-validator');
// cors isn't implimented, should be to restrict domains in production
//Also When time add http headers for security



const { db, admin } = require('./services/authService');


const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api/teams/join', authMiddleware);
app.patch('/api/teams/updateTeam', (req, res, next) => {
    console.log('Received request body:', req.body);
    return next();
});
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);  

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'An unknown error occurred.',
    });
});

const PORT = process.env.PORT || 3001;
app.get('/api/teams', async (req, res) => {
    try {
        const teams = [];
        const teamsSnapshot = await db.collection('teams').get(); 
        
        for (const doc of teamsSnapshot.docs) {
            const teamData = doc.data();

            if (!teamData.deleted && teamData.teamName) {
                let ownerName = '';
                
                
                if (teamData.owner) {
                    const ownerDoc = await db.collection('users').doc(teamData.owner).get();
                    if (ownerDoc.exists) {
                        ownerName = ownerDoc.data().email; 
                    }
                }
                
                teams.push({
                    teamId: doc.id,
                    teamName: teamData.teamName,
                    ownerName: ownerName,
                    totalScore: teamData.totalScore || 0,
                    memberNumber: teamData.members ? teamData.members.length : 0,  
                    availableMemberNumber: teamData.maxMembers - (teamData.members ? teamData.members.length : 0),
                });
            }
        }

        res.status(200).json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});
app.post('/api/teams/join',
    
    [
        // Validation the middleware. this is to prevent attack
        body('teamId')
        .exists().withMessage(' ID is required')
        .trim()
        .escape(),
    ], 
    
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

    try {
        
        const { teamId } = req.body;
        const userId = req.user.uid; // assuming user id via auth middleware

        console.log(`teamId: ${teamId}`);
        console.log(`userId: ${userId}`);
        if (!teamId) {
            return res.status(400).json({ error: 'Team ID is required' });
        }

        // Retrieve team and user from Firestore
        const teamDoc = await db.collection('teams').doc(teamId).get();
        const userDoc = await db.collection('users').doc(userId).get();

        if (!teamDoc.exists || !userDoc.exists) {
            return res.status(404).json({ error: 'Team or user not found' });
        }

        const teamData = teamDoc.data();
        const userData = userDoc.data();

        // Check if the team has space for more members
        if (teamData.memberCount >= teamData.maxMembers) {
            return res.status(400).json({ error: 'Team is full' });
        }

        // Add user to team and update  teamId Please move over below to teamController if you have time
        await db.runTransaction(async (t) => {
            t.update(db.collection('teams').doc(teamId), {
                members: admin.firestore.FieldValue.arrayUnion(userId),
                memberCount: admin.firestore.FieldValue.increment(1),
                totalScore: admin.firestore.FieldValue.increment(userData.score || 0) // Add user’s score to totalScore

            });
            t.update(db.collection('users').doc(userId), {
                teamId: admin.firestore.FieldValue.arrayUnion(teamId)
            });
        });
        
        return res.status(200).json({ message: 'Successfully joined the team' });
    } catch (error) {
        console.error('Failed to join team:', error);
        return res.status(500).json({ error: 'Failed to join team. Please try again later.' });
    }
});

app.get('/api/users', authMiddleware, async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = [];

        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();
            let teamNames = [];
            let ownedTeamNames = [];    

            // If user is a member
            if (Array.isArray(userData.teamId)) {
                for (const id of userData.teamId) {
                    const teamDoc = await db.collection('teams').doc(id).get();
                    if (teamDoc.exists) {
                        teamNames.push(teamDoc.data().teamName);
                    }
                }
            } 
            
            if (Array.isArray(userData.team)) {
                for (const id of userData.team) {
                    const teamDoc = await db.collection('teams').doc(id).get();
                    if (teamDoc.exists) {
                        ownedTeamNames.push(teamDoc.data().teamName);
                    }
                }
            }
            users.push({
                userId: doc.id,
                name: userData.email,
                score: userData.score,  
                teamName: teamNames,
                ownedTeamName: ownedTeamNames,
                
            });
        }

        return res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({ error: 'Failed to retrieve user data. Please try again later.' });
    }
});
app.get('/api/teams/:teamId', async (req, res) => {
    try {
        const teamDoc = await db.collection('teams').doc(req.params.teamId).get();

        if (!teamDoc.exists) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const teamData = teamDoc.data();
        res.status(200).json(teamData);
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

// Get a user 
app.get('/api/users/:userId', async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.params.userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        res.status(200).json(userData);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

app.post('/api/users/signout', (req, res) => {
    res.clearCookie('authToken'); // Clears the authentication cookie
    res.status(200).json({ message: 'Successfully signed out' });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
