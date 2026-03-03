// controllers/reporteController.js
const pool = require('../config/db');

const reporteController = {
    // ===== 1. CREAR REPORTE (API) =====
    crearReporte: async (req, res) => {
        try {
            const {
                tipo, direccion, latitud, longitud,
                colonia, entre_calles, descripcion,
                nombre, email, telefono
            } = req.body;

            // Validar campos obligatorios
            if (!tipo || !direccion || !descripcion) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos obligatorios'
                });
            }

            // Generar folio único (REP-2024-03-0001)
            const fecha = new Date();
            const año = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const hoy = fecha.toISOString().split('T')[0];
            
            const countResult = await pool.query(
                `SELECT COUNT(*) FROM reportes WHERE fecha_reporte::date = $1`,
                [hoy]
            );
            
            const consecutivo = parseInt(countResult.rows[0].count) + 1;
            const folio = `REP-${año}-${mes}-${String(consecutivo).padStart(4, '0')}`;

            // Asignar departamento según tipo
            const departamentoMap = {
                'bache': 3, 'alumbrado': 3, 'basura': 6,
                'fuga': 11, 'drenaje': 11, 'vialidad': 3
            };
            const departamento_id = departamentoMap[tipo] || 3;

            // Insertar en BD
            const result = await pool.query(
                `INSERT INTO reportes (
                    folio, tipo, direccion, latitud, longitud, 
                    colonia, entre_calles, descripcion, nombre, 
                    email, telefono, departamento_id, ip_origen
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *`,
                [
                    folio, tipo, direccion, latitud || null, longitud || null,
                    colonia || null, entre_calles || null, descripcion,
                    nombre || null, email || null, telefono || null,
                    departamento_id, req.ip || req.connection.remoteAddress
                ]
            );

            // Crear seguimiento inicial
            await pool.query(
                `INSERT INTO seguimiento_reportes (reporte_id, estado_nuevo, accion, comentario)
                 VALUES ($1, $2, $3, $4)`,
                [result.rows[0].id, 'pendiente', 'creación', 'Reporte recibido']
            );

            res.status(201).json({
                success: true,
                message: 'Reporte guardado exitosamente',
                folio: folio
            });

        } catch (error) {
            console.error('❌ Error al guardar reporte:', error);
            res.status(500).json({
                success: false,
                message: 'Error al procesar el reporte'
            });
        }
    },

    // ===== 2. CONSULTAR REPORTE POR FOLIO (API) =====
    consultarReporte: async (req, res) => {
        try {
            const { folio } = req.params;
            
            const result = await pool.query(
                `SELECT r.*, d.nombre as departamento
                 FROM reportes r
                 LEFT JOIN departamentos d ON d.id = r.departamento_id
                 WHERE r.folio = $1`,
                [folio]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Reporte no encontrado'
                });
            }

            res.json({
                success: true,
                reporte: result.rows[0]
            });

        } catch (error) {
            console.error('❌ Error al consultar reporte:', error);
            res.status(500).json({
                success: false,
                message: 'Error al consultar el reporte'
            });
        }
    },

    // ===== 3. ACTUALIZAR ESTADO (API) =====
    actualizarEstado: async (req, res) => {
        try {
            const { folio } = req.params;
            const { estado, comentario } = req.body;

            const estadosValidos = ['pendiente', 'en_proceso', 'resuelto', 'rechazado'];
            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado no válido'
                });
            }

            const result = await pool.query(
                `UPDATE reportes 
                 SET estado = $1, 
                     fecha_atencion = CASE WHEN $1 = 'resuelto' THEN CURRENT_TIMESTAMP ELSE fecha_atencion END
                 WHERE folio = $2
                 RETURNING *`,
                [estado, folio]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Reporte no encontrado'
                });
            }

            // Registrar seguimiento
            await pool.query(
                `INSERT INTO seguimiento_reportes (reporte_id, estado_anterior, estado_nuevo, comentario, accion)
                 VALUES ($1, $2, $3, $4, $5)`,
                [result.rows[0].id, result.rows[0].estado, estado, comentario || null, 'actualización']
            );

            res.json({
                success: true,
                message: 'Estado actualizado',
                reporte: result.rows[0]
            });

        } catch (error) {
            console.error('❌ Error al actualizar estado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar estado'
            });
        }
    },

    // ===== 4. LISTAR TODOS (API) =====
    listarTodos: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT r.*, d.nombre as departamento 
                FROM reportes r
                LEFT JOIN departamentos d ON d.id = r.departamento_id
                ORDER BY r.fecha_reporte DESC
            `);
            
            res.json({
                success: true,
                reportes: result.rows
            });
        } catch (error) {
            console.error('❌ Error al listar reportes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener reportes'
            });
        }
    },

    // ===== 5. VER TODOS (VISTA HTML) =====
    verTodos: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT r.*, d.nombre as departamento 
                FROM reportes r
                LEFT JOIN departamentos d ON d.id = r.departamento_id
                ORDER BY r.fecha_reporte DESC
            `);
            
            res.render('admin/reportes', {
                titulo: 'Reportes Ciudadanos',
                reportes: result.rows,
                currentPage: 'admin'
            });
        } catch (error) {
            console.error('❌ Error:', error);
            res.status(500).send('Error al cargar reportes');
        }
    }
};

module.exports = reporteController;