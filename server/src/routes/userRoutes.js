const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, verifyStudent, provisionStaffOrTeacher } = require('../controllers/authController');

router.get('/', getUsers);
router.post('/provision', provisionStaffOrTeacher);
router.post('/', createUser);
router.get('/verify/:studentId', verifyStudent);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
