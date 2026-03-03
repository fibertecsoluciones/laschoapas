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

// ===== MOSTRAR MAPA SATELITAL CON ESRI =====
function mostrarMapa(lat, lng) {
    const mapaDiv = document.getElementById('mapa-preview');
    mapaDiv.style.display = 'block';
    mapaDiv.style.padding = '0';
    mapaDiv.style.background = '#f0f0f0';
    mapaDiv.style.borderRadius = '12px';
    mapaDiv.style.overflow = 'hidden';
    mapaDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    
    // Crear contenedor para el mapa
    mapaDiv.innerHTML = '<div id="leaflet-map" style="height: 300px; width: 100%;"></div>';
    
    // Inicializar mapa después de que el DOM se actualice
    setTimeout(() => {
        const map = L.map('leaflet-map').setView([lat, lng], 18);
        
        // 🛰️ CAPA SATELITAL DE ESRI (World Imagery)
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 19
        }).addTo(map);
        
        // Opcional: Agregar capa de etiquetas (nombres de calles, ciudades)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
            opacity: 0.5 // Capa semitransparente para que se vea la imagen satelital
        }).addTo(map);
        
        // Marcador personalizado con ícono naranja
        const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: '<i class="fas fa-map-marker-alt" style="font-size: 32px; color: #f05c00; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></i>',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
        
        const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
        marker.bindPopup(`
            <div style="text-align: center; padding: 5px;">
                <strong style="color: #f05c00;">📍 Ubicación reportada</strong><br>
                <small>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}</small>
            </div>
        `).openPopup();
        
        // Agregar enlace para abrir en Google Maps
        const linkDiv = document.createElement('div');
        linkDiv.style.marginTop = '10px';
        linkDiv.style.textAlign = 'right';
        linkDiv.innerHTML = `
            <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" 
               style="color: #f05c00; text-decoration: none; font-size: 0.9rem;">
                <i class="fas fa-external-link-alt"></i> Ver en Google Maps
            </a>
        `;
        mapaDiv.appendChild(linkDiv);
        
    }, 100);
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
    
    form.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('📤 Formulario enviado - Guardando en BD');
    
    // Validar campos
    const tipo = document.getElementById('tipoReporte').value;
    const direccion = document.getElementById('direccion').value;
    const descripcion = document.querySelector('textarea[name="descripcion"]').value;
    const privacidad = document.querySelector('input[name="privacidad"]').checked;
    
    if (!tipo || !direccion || !descripcion || !privacidad) {
        alert('Completa todos los campos obligatorios');
        return;
    }
    
    // Mostrar loading
    const btn = e.target.querySelector('.btn-enviar');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>Guardando...</span> <i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;
    
    try {
        // Preparar datos para enviar
        const formData = {
            tipo: tipo,
            direccion: direccion,
            latitud: document.getElementById('latitud').value,
            longitud: document.getElementById('longitud').value,
            colonia: document.querySelector('input[name="colonia"]').value,
            entre_calles: document.querySelector('input[name="entre_calles"]').value,
            descripcion: descripcion,
            nombre: document.querySelector('input[name="nombre"]').value,
            email: document.querySelector('input[name="email"]').value,
            telefono: document.querySelector('input[name="telefono"]').value
        };
        
        console.log('📦 Enviando a BD:', formData);
        
        // 🟢 ENVIAR A LA API REAL
        const response = await fetch('/api/reportes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        console.log('📨 Respuesta del servidor:', data);
        
        if (data.success) {
            // Generar folio (el que viene del servidor)
            document.getElementById('folioGenerado').textContent = data.folio;
            
            // MOSTRAR POPUP
            popup.style.display = 'flex';
            
            // ⏰ Auto-cerrar después de 3 segundos
            setTimeout(() => {
                cerrarPopupYResetear();
            }, 3000);
        } else {
            alert('Error: ' + data.message);
        }
        
    } catch (error) {
        console.error('❌ Error al enviar:', error);
        alert('Error de conexión. Intenta más tarde.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
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