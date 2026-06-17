const express = require('express');
const {
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  getDashboard,
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getWorkspaces).post(createWorkspace);
router.route('/:id').get(getWorkspace).put(updateWorkspace).delete(deleteWorkspace);
router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:userId', removeMember);
router.get('/:id/dashboard', getDashboard);

module.exports = router;
