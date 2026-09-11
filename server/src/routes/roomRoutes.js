const express = require('express');
const router = express.Router();
const {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  addBed,
  removeBed,
  transferStudentRoom,
  createTransferRequest,
  getTransferRequests,
  reviewTransferRequest,
} = require('../controllers/hallController');

router.get('/', getRooms);
router.post('/', createRoom);
router.post('/transfer', transferStudentRoom);
router.post('/transfer-requests', createTransferRequest);
router.get('/transfer-requests', getTransferRequests);
router.put('/transfer-requests/:id/review', reviewTransferRequest);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);
router.post('/:id/beds', addBed);
router.delete('/:id/beds/:bedLabel', removeBed);

module.exports = router;
