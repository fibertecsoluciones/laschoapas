const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController'); // si lo creas
const noticiasController = require('../controllers/noticiasController');
const reporteController = require('../controllers/reporteController'); // 🆕

// Página principal
router.get('/', homeController.index); // o la función que uses

// Páginas estáticas
router.get('/gobierno', (req, res) => {
    res.render('pages/gobierno', { titulo: 'Gobierno', currentPage: 'gobierno' });
});

router.get('/tramites', (req, res) => {
    res.render('pages/tramites', { titulo: 'Trámites', currentPage: 'tramites' });
});

router.get('/contacto', (req, res) => {
    res.render('pages/contacto', { titulo: 'Contacto', currentPage: 'contacto' });
});

// Noticias web
router.get('/noticias', noticiasController.viewAll);
router.get('/noticias/:id', noticiasController.viewSingle);

// 🆕 Ruta para ver tickets (admin)
router.get('/admin/reportes', reporteController.verTodos);

module.exports = router;