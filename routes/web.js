const express = require('express');
const router = express.Router();

// Ruta principal
router.get('/', (req, res) => {
    res.render('index', { 
        titulo: 'Inicio',
        currentPage: 'inicio'
    });
});

// Ruta de gobierno
router.get('/gobierno', (req, res) => {
    res.render('pages/gobierno', { 
        titulo: 'Gobierno',
        currentPage: 'gobierno'
    });
});

// Ruta de trámites
router.get('/tramites', (req, res) => {
    res.render('pages/tramites', { 
        titulo: 'Trámites',
        currentPage: 'tramites'
    });
});

// Ruta de contacto
router.get('/contacto', (req, res) => {
    res.render('pages/contacto', { 
        titulo: 'Contacto',
        currentPage: 'contacto'
    });
});


// ===== NUEVAS RUTAS DE NOTICIAS =====
// Importar el controlador de noticias
const noticiasController = require('../controllers/noticiasController');

// Ruta para ver todas las noticias
router.get('/noticias', noticiasController.viewAll);

// Ruta para ver una noticia individual (con ID)
router.get('/noticias/:id', noticiasController.viewSingle);



module.exports = router;



