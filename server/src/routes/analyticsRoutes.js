const express = require('express');
const router = express.Router();
const {
  getSummary,
  getFinancials,
  createExpense,
  deleteExpense,
} = require('../controllers/analyticsController');

router.get('/summary', getSummary);
router.get('/financials', getFinancials);
router.post('/expenses', createExpense);
router.delete('/expenses/:id', deleteExpense);

module.exports = router;
