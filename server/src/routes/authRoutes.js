const express = require('express');
const router = express.Router();
const { verifyAccessCode } = require('../controllers/authController');

router.post('/verify', verifyAccessCode);

module.exports = router; 