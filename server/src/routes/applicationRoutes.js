const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getApplications,
  trackApplication,
  updateApplicationStatus,
  approveAllocation,
  revokeAllocation,
  deleteApplication,
} = require('../controllers/applicationController');

router.post('/', submitApplication);
router.get('/', getApplications);
router.get('/track/:refOrId', trackApplication);
router.put('/:id/approve-allocation', approveAllocation);
router.put('/:id/revoke-allocation', revokeAllocation);
router.delete('/:id', deleteApplication);
router.put('/:id', updateApplicationStatus);

module.exports = router;
