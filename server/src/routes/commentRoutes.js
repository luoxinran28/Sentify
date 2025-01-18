const express = require('express');
const router = express.Router();
const { analyzeComments, clearComments } = require('../controllers/commentController');

router.post('/analyze', analyzeComments);
router.post('/clear', clearComments);

module.exports = router; 