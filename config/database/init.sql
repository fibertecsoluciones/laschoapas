-- =========================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
-- Ejecutado automáticamente al iniciar la app
-- =========================================

-- 1. CREAR TABLA DEPARTAMENTOS
CREATE TABLE IF NOT EXISTS departamentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    descripcion TEXT,
    email VARCHAR(200),
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos básicos de departamentos
INSERT INTO departamentos (nombre, codigo) 
SELECT * FROM (VALUES
    ('Presidencia', 'PRE'),
    ('Tesorería', 'TES'),
    ('Obras Públicas', 'OBR'),
    ('Registro Civil', 'RCI'),
    ('Protección Civil', 'PCV'),
    ('Desarrollo Social', 'DSO'),
    ('Ecología', 'ECO'),
    ('Transparencia', 'TRA'),
    ('Educación', 'EDU'),
    ('Salud', 'SAL'),
    ('Seguridad Pública', 'SEG'),
    ('Catastro', 'CAT'),
    ('Desarrollo Urbano', 'URB'),
    ('Comercio', 'COM')
) AS datos(nombre, codigo)
WHERE NOT EXISTS (SELECT 1 FROM departamentos WHERE codigo = datos.codigo);

-- 2. CREAR TABLA REPORTES CIUDADANOS
CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    direccion TEXT NOT NULL,
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    colonia VARCHAR(100),
    entre_calles TEXT,
    descripcion TEXT NOT NULL,
    fotos TEXT[],
    nombre VARCHAR(200),
    email VARCHAR(200),
    telefono VARCHAR(20),
    estado VARCHAR(20) DEFAULT 'pendiente',
    departamento_id INTEGER REFERENCES departamentos(id),
    fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_atencion TIMESTAMP,
    ip_origen VARCHAR(50),
    user_agent TEXT,
    metadata JSONB
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_reportes_folio ON reportes(folio);
CREATE INDEX IF NOT EXISTS idx_reportes_tipo ON reportes(tipo);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON reportes(fecha_reporte);

-- 3. CREAR TABLA USUARIOS (para futura administración)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(200) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    nombre VARCHAR(200) NOT NULL,
    apellidos VARCHAR(200),
    telefono VARCHAR(20),
    rol VARCHAR(50) DEFAULT 'ciudadano',
    departamento_id INTEGER REFERENCES departamentos(id),
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. CREAR TABLA DE SEGUIMIENTO DE REPORTES
CREATE TABLE IF NOT EXISTS seguimiento_reportes (
    id SERIAL PRIMARY KEY,
    reporte_id INTEGER REFERENCES reportes(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(50) NOT NULL,
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20),
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. CREAR TABLA DE CONFIGURACIÓN
CREATE TABLE IF NOT EXISTS configuracion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    tipo VARCHAR(50) DEFAULT 'texto',
    descripcion TEXT,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuración inicial
INSERT INTO configuracion (clave, valor, tipo, descripcion) VALUES
('sitio_nombre', 'H. Ayuntamiento de Las Choapas', 'texto', 'Nombre del sitio'),
('sitio_lema', 'Hechos No Palabras', 'texto', 'Lema institucional'),
('email_contacto', 'contacto@laschoapas.gob.mx', 'texto', 'Correo general de contacto'),
('telefono_principal', '(923) 123-4567', 'texto', 'Teléfono del ayuntamiento'),
('direccion', 'Av. Independencia #123, Centro, Las Choapas, Ver.', 'texto', 'Dirección oficial'),
('horario_atencion', '{"lunes_viernes": "9:00-17:00", "sabado": "9:00-13:00"}', 'json', 'Horario de atención')
ON CONFLICT (clave) DO NOTHING;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos inicializada correctamente';
END $$;