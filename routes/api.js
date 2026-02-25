const express = require('express');
const router = express.Router();
const noticiasController = require('../controllers/noticiasController');

// Rutas API para noticias
router.get('/noticias', noticiasController.getAll);
router.get('/noticias/destacadas', noticiasController.getDestacadas);
router.get('/noticias/:id', noticiasController.getById);

module.exports = router;