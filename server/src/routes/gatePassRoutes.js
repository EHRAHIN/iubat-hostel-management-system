const express = require('express');
const router = express.Router();
const {
  getGatePasses,
  createGatePass,
  updateGatePassStatus,
} = require('../controllers/gatePassController');

router.get('/', getGatePasses);
router.post('/', createGatePass);
router.put('/:id', updateGatePassStatus);

module.exports = router;
