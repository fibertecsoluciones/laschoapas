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



-- =========================================
-- TABLAS ADICIONALES PARA MÓDULOS FUTUROS
-- =========================================

-- =========================================
-- 1. TABLA DE NOTICIAS (para migrar desde JSON)
-- =========================================
CREATE TABLE IF NOT EXISTS noticias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    resumen TEXT,
    contenido TEXT NOT NULL,
    categoria VARCHAR(50),
    imagen_principal VARCHAR(500),
    imagenes TEXT[],
    destacada BOOLEAN DEFAULT false,
    vistas INTEGER DEFAULT 0,
    autor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'publicado', -- 'borrador', 'publicado', 'archivado'
    etiquetas TEXT[],
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_noticias_slug ON noticias(slug);
CREATE INDEX IF NOT EXISTS idx_noticias_fecha ON noticias(fecha_publicacion);
CREATE INDEX IF NOT EXISTS idx_noticias_categoria ON noticias(categoria);
CREATE INDEX IF NOT EXISTS idx_noticias_destacada ON noticias(destacada);

-- =========================================
-- 2. TABLA DE TRÁMITES Y SERVICIOS
-- =========================================
CREATE TABLE IF NOT EXISTS tramites (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    descripcion TEXT,
    requisitos TEXT[],
    costo NUMERIC(10,2),
    duracion_estimada INTEGER, -- en días
    departamento_id INTEGER REFERENCES departamentos(id) ON DELETE SET NULL,
    documentacion_necesaria TEXT[],
    en_linea BOOLEAN DEFAULT false,
    url_tramite VARCHAR(500),
    pasos JSONB,
    activo BOOLEAN DEFAULT true,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_tramites_departamento ON tramites(departamento_id);
CREATE INDEX IF NOT EXISTS idx_tramites_activo ON tramites(activo);

-- =========================================
-- 3. TABLA DE SOLICITUDES DE TRÁMITES
-- =========================================
CREATE TABLE IF NOT EXISTS solicitudes_tramites (
    id SERIAL PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    tramite_id INTEGER REFERENCES tramites(id) ON DELETE SET NULL,
    datos JSONB NOT NULL,
    documentos TEXT[],
    estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'en_revision', 'aprobado', 'rechazado', 'completado'
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    asignado_a INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    comentarios TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_folio ON solicitudes_tramites(folio);
CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes_tramites(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_fecha ON solicitudes_tramites(fecha_solicitud);

-- =========================================
-- 4. TABLA DE CONVOCATORIAS
-- =========================================
CREATE TABLE IF NOT EXISTS convocatorias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    tipo VARCHAR(50), -- 'empleo', 'licitacion', 'cultural', 'social'
    descripcion TEXT NOT NULL,
    requisitos JSONB,
    documentos_requeridos TEXT[],
    fecha_publicacion DATE NOT NULL,
    fecha_cierre DATE NOT NULL,
    hora_cierre TIME,
    lugar_presentacion TEXT,
    contacto VARCHAR(200),
    telefono_contacto VARCHAR(20),
    email_contacto VARCHAR(200),
    bases_url VARCHAR(500),
    resultados_url VARCHAR(500),
    estado VARCHAR(20) DEFAULT 'activa', -- 'activa', 'cerrada', 'resultados'
    destacada BOOLEAN DEFAULT false,
    departamento_id INTEGER REFERENCES departamentos(id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_convocatorias_fecha ON convocatorias(fecha_cierre);
CREATE INDEX IF NOT EXISTS idx_convocatorias_tipo ON convocatorias(tipo);
CREATE INDEX IF NOT EXISTS idx_convocatorias_estado ON convocatorias(estado);

-- =========================================
-- 5. TABLA DE DOCUMENTOS DE TRANSPARENCIA
-- =========================================
CREATE TABLE IF NOT EXISTS documentos_transparencia (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(300) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100), -- 'financiero', 'obras', 'directorio', 'normativo'
    archivo_url VARCHAR(500) NOT NULL,
    tipo_archivo VARCHAR(50), -- 'pdf', 'xlsx', 'docx'
    tamaño_bytes INTEGER,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    periodo VARCHAR(20), -- '2024', '2024-Q1', etc.
    vigente BOOLEAN DEFAULT true,
    veces_descargado INTEGER DEFAULT 0,
    departamento_id INTEGER REFERENCES departamentos(id) ON DELETE SET NULL,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON documentos_transparencia(categoria);
CREATE INDEX IF NOT EXISTS idx_documentos_vigente ON documentos_transparencia(vigente);

-- =========================================
-- 6. TABLA DE OBLIGACIONES DE TRANSPARENCIA
-- =========================================
CREATE TABLE IF NOT EXISTS obligaciones_transparencia (
    id SERIAL PRIMARY KEY,
    fraccion VARCHAR(10) NOT NULL,
    titulo VARCHAR(300) NOT NULL,
    descripcion TEXT,
    documentos_ids INTEGER[],
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 7. TABLA DE PAGOS EN LÍNEA
-- =========================================
CREATE TABLE IF NOT EXISTS conceptos_pago (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    monto NUMERIC(10,2),
    departamento_id INTEGER REFERENCES departamentos(id) ON DELETE SET NULL,
    periodicidad VARCHAR(50), -- 'único', 'mensual', 'anual'
    activo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    folio VARCHAR(50) UNIQUE NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    concepto_id INTEGER REFERENCES conceptos_pago(id) ON DELETE SET NULL,
    monto NUMERIC(10,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'pagado', 'cancelado', 'reembolsado'
    metodo_pago VARCHAR(50), -- 'tarjeta', 'transferencia', 'efectivo'
    referencia_pago VARCHAR(100),
    fecha_pago TIMESTAMP,
    fecha_vencimiento DATE,
    comprobante_url VARCHAR(500),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_pagos_folio ON pagos(folio);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);

-- =========================================
-- 8. TABLA DE CONFIGURACIÓN (ampliada)
-- =========================================
-- Ya tienes la tabla configuracion, pero puedes agregar más configuraciones
INSERT INTO configuracion (clave, valor, tipo, descripcion) VALUES
('noticias_por_pagina', '9', 'numero', 'Cantidad de noticias por página'),
('reportes_tiempo_respuesta', '72', 'numero', 'Tiempo de respuesta en horas para reportes'),
('smtp_host', 'smtp.gmail.com', 'texto', 'Servidor SMTP para correos'),
('smtp_port', '587', 'numero', 'Puerto SMTP'),
('email_notificaciones', 'notificaciones@laschoapas.gob.mx', 'texto', 'Correo para notificaciones automáticas')
ON CONFLICT (clave) DO NOTHING;

-- =========================================
-- 9. TABLA DE LOGS Y AUDITORÍA
-- =========================================
CREATE TABLE IF NOT EXISTS logs_actividad (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    modulo VARCHAR(50),
    tabla_afectada VARCHAR(50),
    registro_id INTEGER,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip INET,
    user_agent TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_actividad(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_fecha ON logs_actividad(fecha);
CREATE INDEX IF NOT EXISTS idx_logs_modulo ON logs_actividad(modulo);

-- =========================================
-- 10. TABLA DE SESIONES DE USUARIO
-- =========================================
CREATE TABLE IF NOT EXISTS sesiones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    ip INET,
    user_agent TEXT,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP,
    activa BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_sesiones_token ON sesiones(token);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(usuario_id);