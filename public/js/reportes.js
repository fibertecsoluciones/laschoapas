// public/js/reportes.js

// ===== SELECCIÓN DE TIPO DE REPORTE =====
function initTipoReporte() {
    const tipoCards = document.querySelectorAll('.tipo-card');
    const tipoSeleccionado = document.getElementById('tipoSeleccionado');
    
    if (!tipoCards.length || !tipoSeleccionado) return;
    
    tipoCards.forEach(card => {
        card.addEventListener('click', function() {
            tipoCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            tipoSeleccionado.value = this.dataset.tipo;
        });
    });
}

// ===== OBTENER UBICACIÓN =====
window.obtenerUbicacion = function() {
    if (!navigator.geolocation) {
        alert('❌ Tu navegador no soporta geolocalización');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            document.getElementById('latitud').value = position.coords.latitude;
            document.getElementById('longitud').value = position.coords.longitude;
            
             // 🚫 COMENTADO TEMPORALMENTE POR ERROR CORS
            // fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
            //     .then(res => res.json())
            //     .then(data => {
            //         if (data.display_name) {
            //             document.getElementById('direccion').value = data.display_name.split(',')[0];
            //         }
            //     });
              alert('✅ Ubicación obtenida. Por favor ingresa la dirección manualmente.');
        },
        function(error) {
            alert('❌ No se pudo obtener tu ubicación');
        }
    );
};

// ===== VISTA PREVIA DE FOTOS =====
function initFotos() {
    const inputFotos = document.getElementById('fotos');
    if (!inputFotos) return;
    
    inputFotos.addEventListener('change', function(e) {
        const preview = document.getElementById('vista-previa-fotos');
        preview.innerHTML = '';
        
        Array.from(e.target.files).slice(0, 5).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const div = document.createElement('div');
                div.className = 'foto-preview-item';
                div.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    });
}

// ===== ENVÍO DEL FORMULARIO =====
function initEnvioFormulario() {
    const form = document.getElementById('reporteForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar tipo
        if (!document.getElementById('tipoSeleccionado').value) {
            alert('Selecciona el tipo de reporte');
            return;
        }
        
        // Validar ubicación
        if (!document.getElementById('direccion').value) {
            alert('Ingresa la ubicación del problema');
            return;
        }
        
        // Validar descripción
        if (!document.querySelector('textarea[name="descripcion"]').value.trim()) {
            alert('Ingresa una descripción del problema');
            return;
        }
        
        // Mostrar loading
        const btn = e.target.querySelector('.btn-enviar');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>Enviando...</span> <i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;
        
        try {
            const formData = {
                tipo: document.getElementById('tipoSeleccionado').value,
                direccion: document.getElementById('direccion').value,
                latitud: document.getElementById('latitud').value,
                longitud: document.getElementById('longitud').value,
                colonia: document.querySelector('input[name="colonia"]').value,
                entre_calles: document.querySelector('input[name="entre_calles"]').value,
                descripcion: document.querySelector('textarea[name="descripcion"]').value,
                nombre: document.querySelector('input[name="nombre"]').value,
                email: document.querySelector('input[name="email"]').value,
                telefono: document.querySelector('input[name="telefono"]').value
            };
            
            const response = await fetch('/api/reportes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('folioGenerado').textContent = data.folio;
                document.getElementById('reporteForm').style.display = 'none';
                document.getElementById('reporteExito').style.display = 'block';
            } else {
                alert('Error: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión. Intenta más tarde.');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

// ===== RESET FORMULARIO =====
window.resetFormulario = function() {
    document.getElementById('reporteForm').reset();
    document.getElementById('reporteForm').style.display = 'block';
    document.getElementById('reporteExito').style.display = 'none';
    document.getElementById('mapa-preview').style.display = 'none';
    document.getElementById('vista-previa-fotos').innerHTML = '';
    document.querySelectorAll('.tipo-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('tipoSeleccionado').value = '';
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    initTipoReporte();
    initFotos();
    initEnvioFormulario();
});