// routes/api/noticias.js
const express = require('express');
const router = express.Router();
const noticiasController = require('../../controllers/noticiasController');

// Rutas API para noticias
router.get('/', noticiasController.getAll);
router.get('/destacadas', noticiasController.getDestacadas);
router.get('/:id', noticiasController.getById);

module.exports = router;