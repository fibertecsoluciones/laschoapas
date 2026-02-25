// controllers/noticiasController.js
const fs = require('fs');
const path = require('path');

const noticiasController = {
    // Obtener todas las noticias (para API)
    getAll: (req, res) => {
        try {
            const dataPath = path.join(__dirname, '../data/noticias.json');
            const data = fs.readFileSync(dataPath, 'utf8');
            const noticias = JSON.parse(data).noticias;
            res.json(noticias);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al cargar noticias' });
        }
    },

    // Obtener noticias destacadas (para la página principal)
    getDestacadas: (req, res) => {
        try {
            const limite = parseInt(req.query.limite) || 3;
            const dataPath = path.join(__dirname, '../data/noticias.json');
            const data = fs.readFileSync(dataPath, 'utf8');
            const noticias = JSON.parse(data).noticias;
            const destacadas = noticias
                .filter(n => n.destacada === true)
                .slice(0, limite);
            res.json(destacadas);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al cargar noticias' });
        }
    },

    // Obtener una noticia por ID (para API)
    getById: (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const dataPath = path.join(__dirname, '../data/noticias.json');
            const data = fs.readFileSync(dataPath, 'utf8');
            const noticias = JSON.parse(data).noticias;
            const noticia = noticias.find(n => n.id === id);
            if (!noticia) {
                return res.status(404).json({ error: 'Noticia no encontrada' });
            }
            res.json(noticia);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error al cargar noticia' });
        }
    },

    // Vista de todas las noticias (SIN paginación - por si acaso)
    viewAll: (req, res) => {
        try {
            const dataPath = path.join(__dirname, '../data/noticias.json');
            const data = fs.readFileSync(dataPath, 'utf8');
            const noticias = JSON.parse(data).noticias;
            noticias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            res.render('noticias', {
                titulo: 'Noticias',
                noticias: noticias,
                currentPage: 'noticias'
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Error al cargar noticias');
        }
    },

    // Vista de una noticia individual
    viewSingle: (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const dataPath = path.join(__dirname, '../data/noticias.json');
            const data = fs.readFileSync(dataPath, 'utf8');
            const noticias = JSON.parse(data).noticias;
            const noticia = noticias.find(n => n.id === id);
            if (!noticia) {
                return res.status(404).render('404', { 
                    titulo: 'No encontrada',
                    currentPage: 'noticias'
                });
            }
            const relacionadas = noticias
                .filter(n => n.categoria === noticia.categoria && n.id !== noticia.id)
                .slice(0, 3);
            res.render('noticia', {
                titulo: noticia.titulo,
                noticia: noticia,
                relacionadas: relacionadas,
                currentPage: 'noticias'
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Error al cargar noticia');
        }
    },

    // Vista de todas las noticias con paginación
    viewAllWithPagination: (req, res) => {
        console.log('='.repeat(50));
        console.log('🔍 FUNCIÓN viewAllWithPagination EJECUTADA');
        console.log('📌 URL:', req.url);
        console.log('📌 Página solicitada:', req.query.page || 1);
        
        try {
            const dataPath = path.join(__dirname, '../data/noticias.json');
            console.log('📁 Leyendo archivo:', dataPath);
            
            const data = fs.readFileSync(dataPath, 'utf8');
            const todasLasNoticias = JSON.parse(data).noticias;
            
            console.log('📊 Total noticias en archivo:', todasLasNoticias.length);
            
            // Ordenar por fecha descendente (más recientes primero)
            todasLasNoticias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            
            // Obtener página actual (por defecto página 1)
            const pagina = parseInt(req.query.page) || 1;
            const noticiasPorPagina = 3;
            
            // Calcular índice de inicio y fin
            const inicio = (pagina - 1) * noticiasPorPagina;
            const fin = inicio + noticiasPorPagina;
            
            // Obtener noticias de la página actual
            const noticiasPagina = todasLasNoticias.slice(inicio, fin);
            
            // Calcular total de páginas
            const totalPaginas = Math.ceil(todasLasNoticias.length / noticiasPorPagina);
            
            console.log('📄 Página actual:', pagina);
            console.log('📄 Total páginas:', totalPaginas);
            console.log('📄 Noticias en esta página:', noticiasPagina.length);
            console.log('📄 Índices:', inicio, 'a', fin);
            
            const paginacion = {
                actual: pagina,
                total: totalPaginas,
                anterior: pagina > 1 ? pagina - 1 : null,
                siguiente: pagina < totalPaginas ? pagina + 1 : null
            };
            
            console.log('🔢 Objeto paginación:', paginacion);
            console.log('='.repeat(50));
            
            res.render('noticias', {
                titulo: 'Noticias',
                noticias: noticiasPagina,
                currentPage: 'noticias',
                paginacion: paginacion
            });
        } catch (error) {
            console.error('❌ ERROR:', error);
            res.status(500).send('Error al cargar noticias');
        }
    },

    getDestacadasPaginadas: (req, res) => {
    console.log('='.repeat(50));
    console.log('🎯 FUNCIÓN getDestacadasPaginadas EJECUTADA');
    console.log('📌 Página solicitada:', req.query.page);
    
    try {
        const dataPath = path.join(__dirname, '../data/noticias.json');
        console.log('📁 Leyendo archivo:', dataPath);
        
        const data = fs.readFileSync(dataPath, 'utf8');
        const todasLasNoticias = JSON.parse(data).noticias;
        
        console.log('📊 Total noticias en archivo:', todasLasNoticias.length);
        
        // Filtrar solo destacadas
        const destacadas = todasLasNoticias.filter(n => n.destacada === true);
        console.log('⭐ Noticias destacadas encontradas:', destacadas.length);
        
        if (destacadas.length === 0) {
            console.log('⚠️ No hay noticias destacadas');
            return res.json({
                noticias: [],
                paginacion: {
                    actual: 1,
                    total: 1,
                    anterior: null,
                    siguiente: null
                }
            });
        }
        
        // Ordenar por fecha (más recientes primero)
        destacadas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        // Parámetros de paginación
        const pagina = parseInt(req.query.page) || 1;
        const noticiasPorPagina = 3;
        const inicio = (pagina - 1) * noticiasPorPagina;
        const fin = inicio + noticiasPorPagina;
        
        // Obtener noticias de la página actual
        const noticiasPagina = destacadas.slice(inicio, fin);
        const totalPaginas = Math.ceil(destacadas.length / noticiasPorPagina);
        
        console.log('📄 Página actual:', pagina);
        console.log('📄 Total páginas:', totalPaginas);
        console.log('📄 Noticias en esta página:', noticiasPagina.length);
        
        // Construir respuesta
        const response = {
            noticias: noticiasPagina,
            paginacion: {
                actual: pagina,
                total: totalPaginas,
                anterior: pagina > 1 ? pagina - 1 : null,
                siguiente: pagina < totalPaginas ? pagina + 1 : null
            }
        };
        
        console.log('✅ Respuesta enviada');
        console.log('='.repeat(50));
        
        res.json(response);
        
    } catch (error) {
        console.error('❌ ERROR en getDestacadasPaginadas:', error);
        res.status(500).json({ error: 'Error interno del servidor: ' + error.message });
    }
}
};

module.exports = noticiasController;