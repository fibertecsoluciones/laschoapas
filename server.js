const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 🟢 RUTAS DIRECTAS (sin archivo externo)
app.get('/', (req, res) => {
    res.render('index', { 
        titulo: 'Inicio',
        currentPage: 'inicio'
    });
});

app.get('/gobierno', (req, res) => {
    res.render('pages/gobierno', { 
        titulo: 'Gobierno',
        currentPage: 'gobierno'
    });
});

app.get('/tramites', (req, res) => {
    res.render('pages/tramites', { 
        titulo: 'Trámites',
        currentPage: 'tramites'
    });
});

app.get('/contacto', (req, res) => {
    res.render('pages/contacto', { 
        titulo: 'Contacto',
        currentPage: 'contacto'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════╗
    ║   ✅ SERVIDOR CORRIENDO CORRECTAMENTE ║
    ║   📡 http://localhost:${PORT}          ║
    ╚══════════════════════════════════════╝
    `);
});