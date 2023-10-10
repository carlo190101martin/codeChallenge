const express = require('express');
const { createTeam } = require('../controllers/teamController');
const { deleteTeam } = require('../controllers/teamController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { teamOwnerMiddleware } = require('../middleware/authMiddleware'); //no longer using. should be removed but check first
const { updateTeam } = require('../controllers/teamController');
const { removeMemberFromTeam } = require('../controllers/teamController');


const router = express.Router();

router.post('/', authMiddleware, createTeam);
router.post('/:teamId/remove-member', authMiddleware, removeMemberFromTeam);
router.patch('/updateTeam', authMiddleware, updateTeam);
router.delete('/', authMiddleware, deleteTeam);
module.exports = router;