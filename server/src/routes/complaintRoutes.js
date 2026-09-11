const express = require('express');
const router = express.Router();
const {
  getComplaints,
  createComplaint,
  verifyComplaintByTutor,
  assignComplaintByProvost,
  updateComplaintStatus,
  deleteComplaint,
} = require('../controllers/complaintController');

router.get('/', getComplaints);
router.post('/', createComplaint);
router.put('/:id/verify', verifyComplaintByTutor);
router.put('/:id/assign', assignComplaintByProvost);
router.put('/:id/status', updateComplaintStatus);
router.delete('/:id', deleteComplaint);

module.exports = router;
