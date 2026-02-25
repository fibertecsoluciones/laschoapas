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
    try {
        const fs = require('fs');
        const path = require('path');
        const dataPath = path.join(__dirname, 'data/noticias.json');
        const data = fs.readFileSync(dataPath, 'utf8');
        const todasLasNoticias = JSON.parse(data).noticias;
        
  // 📰 TODAS LAS NOTICIAS (sin filtrar)
const noticiasParaMostrar = todasLasNoticias;  // ← Todas las noticias
        
        // Ordenar por fecha (más recientes primero)
        destacadas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        // 📄 PAGINACIÓN
        const pagina = parseInt(req.query.page) || 1;
        const noticiasPorPagina = 3;
        const inicio = (pagina - 1) * noticiasPorPagina;
        const fin = inicio + noticiasPorPagina;
        
        // Noticias de la página actual
        const noticiasPagina = destacadas.slice(inicio, fin);
        const totalPaginas = Math.ceil(destacadas.length / noticiasPorPagina);
        
        res.render('index', { 
            titulo: 'Inicio',
            currentPage: 'inicio',
            noticias: noticiasPagina,
            paginacion: {
                actual: pagina,
                total: totalPaginas,
                anterior: pagina > 1 ? pagina - 1 : null,
                siguiente: pagina < totalPaginas ? pagina + 1 : null
            }
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.render('index', { 
            titulo: 'Inicio',
            currentPage: 'inicio',
            noticias: [],
            paginacion: {
                actual: 1,
                total: 1,
                anterior: null,
                siguiente: null
            }
        });
    }
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

// ===== RUTAS DE NOTICIAS =====
const noticiasController = require('./controllers/noticiasController');

// 🟢 Ruta para ver UNA noticia individual (SÍ la usamos)
app.get('/noticias/:id', noticiasController.viewSingle);

// 🔴 Ruta ELIMINADA - Ya no usamos página separada de noticias
// app.get('/noticias', noticiasController.viewAllWithPagination);

// ✅ Rutas API para datos JSON (estas SÍ se usan)
app.get('/api/noticias', noticiasController.getAll);
app.get('/api/noticias/destacadas', noticiasController.getDestacadas);
app.get('/api/noticias/:id', noticiasController.getById);
app.get('/api/noticias/destacadas-paginadas', noticiasController.getDestacadasPaginadas);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════╗
    ║   ✅ SERVIDOR CORRIENDO CORRECTAMENTE ║
    ║   📡 http://localhost:${PORT}          ║
    ╚══════════════════════════════════════╝
    `);
});