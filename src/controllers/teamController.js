const admin = require('firebase-admin');
const db = admin.firestore();

async function createTeam(req, res, next) {
    try {
      console.log('Create Team Request Body: ', req.body);  
      const { teamName, maxMembers } = req.body;
  
      if (!teamName || !maxMembers || maxMembers <= 10) {
        return res.status(400).json({ error: 'Invalid input data' });
      }
  
      const teamSnapshot = await db.collection('teams').where('teamName', '==', teamName).get();
      if (!teamSnapshot.empty) {
        return res.status(400).json({ error: 'Team with this name already exists' });
      }
      const userSnapshot = await db.collection('users').doc(req.user.uid).get();
      if (!userSnapshot.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
      const user = userSnapshot.data();
  
      const newTeam = {
        teamName,
        maxMembers,
        owner: req.user.uid,
        members: [req.user.uid], 
        totalScore: user.score,
      };
  
      const teamDocRef = await db.collection('teams').add(newTeam);
      const teamId = teamDocRef.id;
  
      await db.collection('users').doc(req.user.uid).update({
        team: admin.firestore.FieldValue.arrayUnion(teamId)
  // Using the team id from the created team document
      });
  
      res.status(201).json({ message: 'Team created successfully', teamId });
    } catch (error) {
      console.error('Error creating team:', error);
      next(error);
    }
  }
  const deleteTeam = async (req, res) => {
    try {
        const { teamName } = req.body;

        // Validate input
        if(typeof teamName !== 'string' || teamName.trim() === '') {
            return res.status(400).json({ error: 'Invalid team name' });
        }

        // Find the team with the current name
        const teamQuerySnapshot = await db.collection('teams').where('teamName', '==', teamName).get();

        if(teamQuerySnapshot.empty) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Assumes team names are unique. If they are not, additional checks are needed.
        const teamDocRef = teamQuerySnapshot.docs[0].ref;
        
        // Check if the requester is the owner of the team
        const teamData = teamQuerySnapshot.docs[0].data();
        if(teamData.owner !== req.user.uid) {
            return res.status(403).json({ error: 'User is not the team owner' });
        }

        // Delete the team in the database
        await teamDocRef.delete();

        return res.status(200).json({ message: 'Team deleted successfully!' });
    } catch (error) {
        console.error('Error deleting team:', error);
        return res.status(500).json({ error: 'Failed to delete team. Please try again.' });
    }
};


const updateTeam = async (req, res) => {
    try {
        const { currentTeamName, newTeamName, newMaxMembers } = req.body;

        // Validate input
        if(typeof newTeamName !== 'string' || newTeamName.trim() === '') {
            return res.status(400).json({ error: 'Invalid team name' });
        }

        if(typeof newMaxMembers !== 'number' || newMaxMembers <= 0) {
            return res.status(400).json({ error: 'Invalid maximum members' });
        }

        // Find the team with the current name
        const teamQuerySnapshot = await db.collection('teams').where('teamName', '==', currentTeamName).get();

        if(teamQuerySnapshot.empty) {
            return res.status(404).json({ error: 'Team not found' });
        }
        if (!currentTeamName || !newTeamName || typeof newMaxMembers !== 'number') {
            return res.status(400).json({ error: 'Invalid input data' 
            });
        }

        // Assumes team names are unique. If they are not, additional checks are needed.
        const teamDocRef = teamQuerySnapshot.docs[0].ref;
        
        // Check if the requester is the owner of the team
        const teamData = teamQuerySnapshot.docs[0].data();
        if(teamData.owner !== req.user.uid) {
            return res.status(403).json({ error: 'User is not the team owner' });
        }

        // Update the team name and maximum members in the database
        await teamDocRef.update({
            teamName: newTeamName,
            maxMembers: newMaxMembers,
        });

        return res.status(200).json({ message: 'Team updated successfully!' });
    } catch (error) {
        console.error('Error updating team:', error);
        return res.status(500).json({ error: 'Failed to update team. Please try again.' });
    }
};

async function removeMemberFromTeam(req, res) {
  try {
      console.log('Received Request Body:', req.body);  // Log the payload
      const teamId = req.params.teamId;
      const { memberId } = req.body;
      console.log(`Team ID: ${teamId}, Member ID: ${memberId}`);

      if (!teamId || !memberId) {
          return res.status(400).json({ error: 'Team ID and Member ID are required' });
      }

      // Retrieve team from Firestore
      const teamDoc = await db.collection('teams').doc(teamId).get();
      const teamData = teamDoc.data();

      if (!teamDoc.exists) {
          return res.status(404).json({ error: 'Team not found' });
      }
      if (!teamData.members.includes(memberId)) {
        console.log('Member not in team');
        return res.status(400).json({ error: 'Member not in team' });
    }
    if (!teamDoc.exists) {
      console.log('Team not found in DB');
      return res.status(404).json({ error: 'Team not found' });
  }


      // Check if member is in team
      if (!teamData.members.includes(memberId)) {
          return res.status(400).json({ error: 'Member not in team' });
      }
      const memberDoc = await db.collection('users').doc(memberId).get();
      const memberData = memberDoc.data();
      const newTotalScore = (teamData.totalScore || 0) - (memberData.score || 0);


      // Remove the member from the team
      await db.collection('teams').doc(teamId).update({
          members: admin.firestore.FieldValue.arrayRemove(memberId),
          totalScore: newTotalScore,

          // Update other properties as necessary
      });

      return res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
      console.error('Error removing member:', error);
      res.status(500).json({ error: 'Failed to remove member' });
  }
}

///this in new
  
  module.exports = {
    createTeam,
    updateTeam,
    deleteTeam,
    removeMemberFromTeam,
  };
  

