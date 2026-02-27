// database/init.js
const fs = require('fs');
const path = require('path');
const pool = require('/config/db');

/**
 * Inicializa la base de datos ejecutando el script SQL
 * Se ejecuta automáticamente al iniciar la aplicación
 */
async function initializeDatabase() {
    try {
        console.log('🔄 Verificando/Inicializando base de datos...');
        
        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, 'init.sql');
        
        // Verificar que el archivo existe
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`No se encuentra el archivo SQL: ${sqlPath}`);
        }
        
        const sqlScript = fs.readFileSync(sqlPath, 'utf8');
        
        console.log('📁 Ejecutando script SQL...');
        
        // Ejecutar el script
        await pool.query(sqlScript);
        
        console.log('✅ Script SQL ejecutado correctamente');
        
        // Verificar que las tablas existen
        await verificarTablas();
        
        console.log('✅ Base de datos inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        
        // No detenemos la app, pero registramos el error
        console.log('⚠️ La aplicación continuará, pero algunas funciones pueden no estar disponibles');
    }
}

/**
 * Verifica que las tablas necesarias existen
 */
async function verificarTablas() {
    try {
        const tablas = ['departamentos', 'reportes', 'usuarios', 'seguimiento_reportes', 'configuracion'];
        
        console.log('🔍 Verificando tablas creadas:');
        
        for (const tabla of tablas) {
            const result = await pool.query(
                `SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                )`,
                [tabla]
            );
            
            if (result.rows[0].exists) {
                // Contar registros
                const countResult = await pool.query(`SELECT COUNT(*) FROM ${tabla}`);
                const count = countResult.rows[0].count;
                
                console.log(`   ✅ Tabla '${tabla}' (${count} registros)`);
            } else {
                console.log(`   ❌ Tabla '${tabla}' NO encontrada`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error verificando tablas:', error);
    }
}

/**
 * Obtiene un departamento por su código
 */
async function getDepartamentoPorCodigo(codigo) {
    try {
        const result = await pool.query(
            'SELECT * FROM departamentos WHERE codigo = $1',
            [codigo]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error obteniendo departamento:', error);
        return null;
    }
}

/**
 * Obtiene todos los departamentos
 */
async function getDepartamentos() {
    try {
        const result = await pool.query(
            'SELECT * FROM departamentos ORDER BY id'
        );
        return result.rows;
    } catch (error) {
        console.error('Error obteniendo departamentos:', error);
        return [];
    }
}

/**
 * Reinicia la base de datos (SOLO PARA DESARROLLO)
 * CUIDADO: Esto borra todos los datos
 */
async function resetDatabase() {
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ No se puede reiniciar BD en producción');
        return;
    }
    
    try {
        console.log('⚠️ REINICIANDO BASE DE DATOS...');
        
        // Eliminar tablas en orden (por las foreign keys)
        await pool.query('DROP TABLE IF EXISTS seguimiento_reportes CASCADE');
        await pool.query('DROP TABLE IF EXISTS reportes CASCADE');
        await pool.query('DROP TABLE IF EXISTS usuarios CASCADE');
        await pool.query('DROP TABLE IF EXISTS configuracion CASCADE');
        await pool.query('DROP TABLE IF EXISTS departamentos CASCADE');
        
        console.log('✅ Tablas eliminadas');
        
        // Volver a inicializar
        await initializeDatabase();
        
    } catch (error) {
        console.error('❌ Error reiniciando BD:', error);
    }
}

module.exports = {
    initializeDatabase,
    verificarTablas,
    getDepartamentoPorCodigo,
    getDepartamentos,
    resetDatabase
};