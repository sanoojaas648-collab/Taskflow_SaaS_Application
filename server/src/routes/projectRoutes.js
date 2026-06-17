const express = require('express');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(getProject).put(updateProject).delete(deleteProject);

module.exports = router;
