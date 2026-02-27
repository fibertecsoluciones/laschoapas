-- =========================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
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
    ('Transparencia', 'TRA')
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
    ip_origen VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_reportes_folio ON reportes(folio);
CREATE INDEX IF NOT EXISTS idx_reportes_tipo ON reportes(tipo);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);