const express = require('express');
const router = express.Router();
const { analyzeComments } = require('../controllers/commentController');

router.post('/analyze', analyzeComments);

module.exports = router; 