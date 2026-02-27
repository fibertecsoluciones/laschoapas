// database/init.js
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');  // ✅ Ruta correcta (dos puntos)

async function initializeDatabase() {
    try {
        console.log('🔄 Verificando/Inicializando base de datos...');
        
        const sqlPath = path.join(__dirname, 'init.sql');
        
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`No se encuentra el archivo SQL: ${sqlPath}`);
        }
        
        const sqlScript = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📁 Ejecutando script SQL...');
        
        await pool.query(sqlScript);
        
        console.log('✅ Script SQL ejecutado correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
    }
}

module.exports = { initializeDatabase };