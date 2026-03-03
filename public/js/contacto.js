// ===== SINCRONIZAR TARJETAS CON SELECT OCULTO =====
function initTipoReporte() {
    const tipoCards = document.querySelectorAll('.tipo-card');
    const tipoSelect = document.getElementById('tipoReporte');
    const tipoSeleccionado = document.getElementById('tipoSeleccionado');
    
    if (!tipoCards.length || !tipoSelect) return;
    
    tipoCards.forEach(card => {
        card.addEventListener('click', function() {
            tipoCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            const tipo = this.dataset.tipo;
            tipoSelect.value = tipo;
            if (tipoSeleccionado) tipoSeleccionado.value = tipo;
            console.log('📌 Tipo seleccionado:', tipo);
        });
    });
}

// ===== VISTA PREVIA DE FOTOS =====
// ===== VISTA PREVIA DE FOTOS =====
function initFotos() {
    const inputFotos = document.getElementById('fotos');
    if (!inputFotos) return;
    
    inputFotos.addEventListener('change', function(e) {
        const preview = document.getElementById('vista-previa-fotos');
        preview.innerHTML = '';
        
        const archivos = Array.from(e.target.files);
        console.log('📸 Archivos seleccionados:', archivos.length);
        
        if (archivos.length === 0) return;
        
        // Limitar a 5 archivos
        const maxArchivos = 5;
        const archivosAMostrar = archivos.slice(0, maxArchivos);
        
        // Mostrar cada imagen
        archivosAMostrar.forEach((file, index) => {
            if (!file.type.startsWith('image/')) {
                console.warn(`⚠️ El archivo ${file.name} no es una imagen`);
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const div = document.createElement('div');
                div.className = 'foto-preview-item';
                div.innerHTML = `<img src="${e.target.result}" alt="Vista previa ${index + 1}">`;
                preview.appendChild(div);
            };
            
            reader.onerror = function() {
                console.error(`❌ Error al leer el archivo ${file.name}`);
            };
            
            reader.readAsDataURL(file);
        });
        
        // Si hay más archivos, mostrar contador
        if (archivos.length > maxArchivos) {
            const mensaje = document.createElement('div');
            mensaje.className = 'foto-preview-mensaje';
            mensaje.innerHTML = `<small>+ ${archivos.length - maxArchivos} fotos más (máx. 5)</small>`;
            preview.appendChild(mensaje);
        }
    });
}

// ===== OBTENER UBICACIÓN REAL =====
window.obtenerUbicacion = function() {
    if (!navigator.geolocation) {
        alert('❌ Tu navegador no soporta geolocalización');
        return;
    }
    
    const btn = document.querySelector('.btn-ubicacion');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Obteniendo ubicación...';
    btn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            // Éxito - obtener coordenadas
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            console.log('📍 Ubicación obtenida:', lat, lng);
            
            // Guardar coordenadas en los campos ocultos
            document.getElementById('latitud').value = lat;
            document.getElementById('longitud').value = lng;
            
            // Mostrar mapa con la ubicación
            mostrarMapa(lat, lng);
            
            // Obtener dirección aproximada (opcional)
            obtenerDireccionPorCoordenadas(lat, lng);
            
            btn.innerHTML = originalText;
            btn.disabled = false;
        },
        function(error) {
            // Error
            let mensaje = '❌ Error al obtener ubicación: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    mensaje += 'Permiso denegado';
                    break;
                case error.POSITION_UNAVAILABLE:
                    mensaje += 'Información no disponible';
                    break;
                case error.TIMEOUT:
                    mensaje += 'Tiempo de espera agotado';
                    break;
            }
            alert(mensaje);
            btn.innerHTML = originalText;
            btn.disabled = false;
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
};

// ===== MOSTRAR MAPA CON LA UBICACIÓN =====
function mostrarMapa(lat, lng) {
    const mapaDiv = document.getElementById('mapa-preview');
    mapaDiv.style.display = 'block';
    
    // Crear iframe con OpenStreetMap
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
    
    mapaDiv.innerHTML = `
        <iframe 
            width="100%" 
            height="250" 
            frameborder="0" 
            scrolling="no" 
            marginheight="0" 
            marginwidth="0" 
            src="${mapUrl}"
            style="border: 1px solid #ddd; border-radius: 8px;">
        </iframe>
        <p style="margin-top: 5px; font-size: 0.8rem; color: #666;">
            <i class="fas fa-map-marker-alt"></i> Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}
        </p>
    `;
}

// ===== OBTENER DIRECCIÓN APROXIMADA (OPCIONAL) =====
function obtenerDireccionPorCoordenadas(lat, lng) {
    // Usar API de Nominatim (OpenStreetMap) - gratis sin API key
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`, {
        headers: {
            'User-Agent': 'LasChoapasApp/1.0'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.display_name) {
            // Extraer dirección corta
            const direccion = data.display_name.split(',')[0];
            document.getElementById('direccion').value = direccion;
            console.log('📋 Dirección encontrada:', direccion);
        }
    })
    .catch(error => {
        console.warn('⚠️ No se pudo obtener la dirección:', error);
    });
}


document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 JS cargado - Solo formulario');
    
    const form = document.getElementById('reporteForm');
    const popup = document.getElementById('popupExito');
    
    // Verificar que los elementos existen
    if (!form) {
        console.error('❌ No se encontró el formulario');
        return;
    }
    
    if (!popup) {
        console.error('❌ No se encontró el popup');
        return;
    }
    
    // Inicializar las tarjetas de tipo
    initTipoReporte();
    
    // 🟢 AHORA SÍ, inicializar fotos DENTRO del DOMContentLoaded
    initFotos();
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('📤 Formulario enviado');
        
        // Validar campos
        const tipo = document.getElementById('tipoReporte').value;
        const direccion = document.getElementById('direccion').value;
        const descripcion = document.querySelector('textarea[name="descripcion"]').value;
        const privacidad = document.querySelector('input[name="privacidad"]').checked;
        
        if (!tipo || !direccion || !descripcion || !privacidad) {
            alert('Completa todos los campos obligatorios');
            return;
        }
        
        // Generar folio
        const folio = 'REP-' + Date.now().toString().slice(-8);
        document.getElementById('folioGenerado').textContent = folio;
        
        // MOSTRAR POPUP
        popup.style.display = 'flex';
        
        // ⏰ Auto-cerrar después de 3 segundos
        setTimeout(() => {
            cerrarPopupYResetear();
        }, 3000);
    });
});

// Función para cerrar popup y resetear formulario
function cerrarPopupYResetear() {
    console.log('🔄 Cerrando popup y reseteando formulario');
    
    try {
        // 1. Ocultar popup
        document.getElementById('popupExito').style.display = 'none';
        
        // 2. RESETEAR CAMPOS UNO POR UNO
        document.getElementById('tipoReporte').value = '';
        document.getElementById('direccion').value = '';
        
        const descripcion = document.querySelector('textarea[name="descripcion"]');
        if (descripcion) descripcion.value = '';
        
        const privacidad = document.querySelector('input[name="privacidad"]');
        if (privacidad) privacidad.checked = false;
        
        // 3. Limpiar datos opcionales
        const colonia = document.querySelector('input[name="colonia"]');
        if (colonia) colonia.value = '';
        
        const entreCalles = document.querySelector('input[name="entre_calles"]');
        if (entreCalles) entreCalles.value = '';
        
        const nombre = document.querySelector('input[name="nombre"]');
        if (nombre) nombre.value = '';
        
        const email = document.querySelector('input[name="email"]');
        if (email) email.value = '';
        
        const telefono = document.querySelector('input[name="telefono"]');
        if (telefono) telefono.value = '';
        
        // 4. Limpiar selector de tipo (tarjetas)
        const tipoSeleccionado = document.getElementById('tipoSeleccionado');
        if (tipoSeleccionado) {
            document.querySelectorAll('.tipo-card').forEach(c => c.classList.remove('selected'));
            tipoSeleccionado.value = '';
        }
        
        // 5. Limpiar previsualización de fotos
        const preview = document.getElementById('vista-previa-fotos');
        if (preview) preview.innerHTML = '';
        
        // 6. Ocultar mapa preview
        const mapa = document.getElementById('mapa-preview');
        if (mapa) mapa.style.display = 'none';
        
        console.log('✅ Formulario reseteado');
    } catch (error) {
        console.error('❌ Error al resetear:', error);
    }
}