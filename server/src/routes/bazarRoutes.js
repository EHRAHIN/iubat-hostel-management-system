const express = require('express');
const router = express.Router();
const {
  getRequisitions,
  createRequisition,
  approveRequisition,
  rejectRequisition,
  markPurchased,
  getStock,
  updateStockItem,
  getDailyReport,
  getMonthlyReport,
} = require('../controllers/bazarController');

router.get('/requisitions', getRequisitions);
router.post('/requisitions', createRequisition);
router.put('/requisitions/:id/approve', approveRequisition);
router.put('/requisitions/:id/reject', rejectRequisition);
router.put('/requisitions/:id/purchase', markPurchased);
router.get('/stock', getStock);
router.put('/stock/:id', updateStockItem);
router.get('/daily-report', getDailyReport);
router.get('/report', getDailyReport);
router.get('/monthly-report', getMonthlyReport);

module.exports = router;
