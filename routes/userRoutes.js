const express = require('express');
const { createUser, getAllUsers, deleteUser, getMe } = require('../controller/userController');
const { protect } = require('../controller/authController');

const router = express.Router();

router.get('/me', protect, getMe);
router.get('/', protect, getAllUsers);
router.post('/', createUser);
router.delete('/:id', protect, deleteUser);

module.exports = router;