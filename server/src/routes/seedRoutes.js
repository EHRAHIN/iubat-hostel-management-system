const express = require('express');
const router = express.Router();
const { seedDatabase } = require('../controllers/seedController');

router.post('/', seedDatabase);
router.get('/', seedDatabase);

module.exports = router;
