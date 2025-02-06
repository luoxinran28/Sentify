const express = require('express');
const router = express.Router();
const { verifyAccessCode } = require('../controllers/authController');

// 验证码验证路由
router.post('/verify', verifyAccessCode);

module.exports = router; 