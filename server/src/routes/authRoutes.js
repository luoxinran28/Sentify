const express = require('express');
const router = express.Router();
const { verifyCode } = require('../controllers/authController');

// 验证码验证路由
router.post('/verify', verifyCode);

module.exports = router; 