(() => {
    //-- Script que dibuja las tarjetas en pantalla --
        
    const contenedorGlobal = document.getElementById('lista-vocabulario');

    // Función que lee la variable 'vocabulario' del archivo datos.js
    function renderizarVocabulario() {
        contenedorGlobal.innerHTML = '';

        // Creamos el contenedor del índice flotante al principio de la página
        const navIndice = document.createElement('div');
        navIndice.className = 'indice-alfabetico';
        contenedorGlobal.appendChild(navIndice);

        // Ordenamos alfabéticamente
        vocabulario.sort((a, b) => a.termino.localeCompare(b.termino));

        let ultimaLetra = "";
        let contenedorColumnasActual = null;

        vocabulario.forEach(palabra => {
            const letraActual = palabra.termino.charAt(0).toUpperCase();

            // Si cambia la letra, cerramos el bloque anterior y creamos uno nuevo
            if (letraActual !== ultimaLetra) {
                ultimaLetra = letraActual;

                // Creamos el botón del índice para esta letra
                const enlaceLetra = document.createElement('a');
                enlaceLetra.href = `#letra-${ultimaLetra}`;
                enlaceLetra.textContent = ultimaLetra;
                enlaceLetra.className = 'enlace-indice';
                navIndice.appendChild(enlaceLetra);

                
                // Creamos el título de la sección y le asignamos el ID de anclaje
                const h3 = document.createElement('h3');
                h3.className = 'titulo-letra';
                h3.id = `letra-${ultimaLetra}`; // El id que conecta con el href
                h3.textContent = ultimaLetra;
                contenedorGlobal.appendChild(h3);

                // Creamos el contenedor de columnas
                contenedorColumnasActual = document.createElement('div');
                contenedorColumnasActual.className = 'bloque-columnas-alfabetico';
                contenedorGlobal.appendChild(contenedorColumnasActual);
            }

            // Creamos la tarjeta
            const div = document.createElement('div');
            div.className = 'item-vocabulario';
                
            let contenidoHTML = `<dt>${palabra.termino}</dt>
                                    <dd>${palabra.definicion}</dd>`;

            // Si tiene imagen asignada en el archivo JS, añade la cámara y la foto flotante
            if (palabra.imagen) {
                contenidoHTML += `<svg class="icono-camara" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                </svg>
                                <img src="${palabra.imagen}" alt="Previsualización" class="imagen-hover">`;
            }
            
            div.innerHTML = contenidoHTML;

            // Ahora la tarjeta se mete dentro de su grupo alfabético y no suelta en el global
            if (contenedorColumnasActual) {
                contenedorColumnasActual.appendChild(div);
            }
        });
    }

    // Ejecutamos la función automáticamente al abrir la página
    renderizarVocabulario();
})();