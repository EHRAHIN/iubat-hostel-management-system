const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  seedItems,
} = require('../controllers/itemController');

router.route('/')
  .get(getItems)
  .post(createItem);

router.route('/seed')
  .post(seedItems);

router.route('/:id')
  .get(getItemById)
  .put(updateItem)
  .delete(deleteItem);

module.exports = router;
