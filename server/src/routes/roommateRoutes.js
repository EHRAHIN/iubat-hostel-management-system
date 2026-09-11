const express = require('express');
const router = express.Router();
const { evaluateMatch, getCandidates, smartAssignSeat } = require('../controllers/roommateController');

router.post('/evaluate', evaluateMatch);
router.post('/smart-assign', smartAssignSeat);
router.get('/candidates', getCandidates);

module.exports = router;
