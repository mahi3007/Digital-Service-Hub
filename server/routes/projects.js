const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getProjects,
  getProjectById,
  updateMilestone,
  approveMilestone,
  uploadDeliverable,
  getUserProjects,
  getVendorProjects
} = require('../controllers/projectController');

router.use(protect);

router.get('/', getProjects);
router.get('/user/me', getUserProjects);
router.get('/vendor/me', getVendorProjects);
router.get('/:id', getProjectById);
router.put('/:projectId/milestone/:milestoneId', updateMilestone);
router.post('/:projectId/milestone/:milestoneId/approve', approveMilestone);
router.post('/:projectId/milestone/:milestoneId/deliverable', uploadDeliverable);

module.exports = router;
