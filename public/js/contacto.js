// ===== SINCRONIZAR TARJETAS CON SELECT OCULTO =====
function initTipoReporte() {
    const tipoCards = document.querySelectorAll('.tipo-card');
    const tipoSelect = document.getElementById('tipoReporte');
    const tipoSeleccionado = document.getElementById('tipoSeleccionado');
    
    if (!tipoCards.length || !tipoSelect) return;
    
    tipoCards.forEach(card => {
        card.addEventListener('click', function() {
            // Quitar selección anterior
            tipoCards.forEach(c => c.classList.remove('selected'));
            
            // Seleccionar esta tarjeta
            this.classList.add('selected');
            
            // Obtener el tipo de la tarjeta
            const tipo = this.dataset.tipo;
            
            // Actualizar el select oculto
            tipoSelect.value = tipo;
            
            // Actualizar el campo oculto (si existe)
            if (tipoSeleccionado) {
                tipoSeleccionado.value = tipo;
            }
            
            console.log('📌 Tipo seleccionado:', tipo);
        });
    });
}


document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 JS cargado');
    
    const form = document.getElementById('reporteForm');
    const popup = document.getElementById('popupExito');
     initTipoReporte();
    
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

// Función para cerrar popup y resetear formulario MANUALMENTE
function cerrarPopupYResetear() {
    console.log('🔄 Cerrando popup y reseteando formulario');
    
    // 1. Ocultar popup
    document.getElementById('popupExito').style.display = 'none';
    
    // 2. RESETEAR CAMPOS UNO POR UNO (más seguro que .reset())
    document.getElementById('tipoReporte').value = '';
    document.getElementById('direccion').value = '';
    document.querySelector('textarea[name="descripcion"]').value = '';
    document.querySelector('input[name="privacidad"]').checked = false;
    
    // 3. Limpiar datos opcionales
    document.querySelector('input[name="colonia"]').value = '';
    document.querySelector('input[name="entre_calles"]').value = '';
    document.querySelector('input[name="nombre"]').value = '';
    document.querySelector('input[name="email"]').value = '';
    document.querySelector('input[name="telefono"]').value = '';
    
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
}