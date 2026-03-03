// routes/api/reportes.js
const express = require('express');
const router = express.Router();
const reporteController = require('../../controllers/reporteController');

// Rutas API para reportes
router.post('/', reporteController.crearReporte);
router.get('/:folio', reporteController.consultarReporte);
router.put('/:folio/estado', reporteController.actualizarEstado);
router.get('/', reporteController.listarTodos);

module.exports = router;