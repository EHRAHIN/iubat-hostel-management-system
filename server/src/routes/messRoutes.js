const express = require('express');
const router = express.Router();
const {
  getMenu,
  updateMenu,
  getBookings,
  applyMeal,
  approveMealBooking,
  rejectMealBooking,
  getStudentMealSummary,
  getMessStats,
} = require('../controllers/messController');

router.get('/menu', getMenu);
router.post('/menu', updateMenu);
router.get('/bookings', getBookings);
router.post('/apply', applyMeal);
router.put('/bookings/:id/approve', approveMealBooking);
router.put('/bookings/:id/reject', rejectMealBooking);
router.get('/student-summary/:studentId', getStudentMealSummary);
router.get('/stats', getMessStats);

module.exports = router;
