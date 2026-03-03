// routes/api.js
const express = require('express');
const router = express.Router();

// Importar todas las APIs
router.use('/noticias', require('./api/noticias'));
router.use('/reportes', require('./api/reportes'));

module.exports = router;