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

// ===== INICIALIZAR BASE DE DATOS =====
const { initializeDatabase } = require('./database/init');

// ===== 🟢 RUTAS WEB =====
app.use('/', require('./routes/web'));

// ===== 🔵 RUTAS API =====
app.use('/api', require('./routes/api'));

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => res.status(200).send('OK'));

// ===== INICIAR SERVIDOR =====
async function startServer() {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`
    ╔══════════════════════════════════════╗
    ║   🚀 LASCHOAPAS STAR - PRODUCCIÓN   ║
    ║   📡 Puerto: ${PORT}                  ║
    ╚══════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

startServer();