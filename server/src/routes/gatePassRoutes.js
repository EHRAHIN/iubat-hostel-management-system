const express = require('express');
const router = express.Router();
const {
  getGatePasses,
  createGatePass,
  updateGatePassStatus,
  verifyGatePassQr,
} = require('../controllers/gatePassController');

router.get('/', getGatePasses);
router.post('/', createGatePass);
router.post('/verify-qr', verifyGatePassQr);
router.put('/:id', updateGatePassStatus);

module.exports = router;
