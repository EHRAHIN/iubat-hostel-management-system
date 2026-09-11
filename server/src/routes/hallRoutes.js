const express = require('express');
const router = express.Router();
const { getHalls, getHallById, getHallFloorMatrix } = require('../controllers/hallController');

router.get('/', getHalls);
router.get('/:id', getHallById);
router.get('/:hallId/matrix', getHallFloorMatrix);

module.exports = router;
