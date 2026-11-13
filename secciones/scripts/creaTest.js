(() => {
    const contenedorGlobal = document.getElementById('contenedor-test'); 

    function renderizarTest() {
        if (!contenedorGlobal) {
            console.error("No se encontró el contenedor con el ID 'lista-vocabulario' en el HTML.");
            return;
        }

        contenedorGlobal.innerHTML = '';

        // 1. Contenedor de columna única responsiva centrado
        const contenedorColumnaUnica = document.createElement('div');
        contenedorColumnaUnica.className = 'bloque-columna-test';
        contenedorGlobal.appendChild(contenedorColumnaUnica);

        // 2. Recorremos las preguntas manteniendo su orden original
        bd_test.forEach((item, indice) => {
            const idTarjeta = `pregunta-${item.id}`;

            const divTarjeta = document.createElement('div');
            divTarjeta.className = 'item-vocabulario tarjeta-test-unica';
            divTarjeta.id = idTarjeta;const contenedorGlobal = document.getElementById('contenedor-test'); 

            let contenidoHTML = `
                <span class="etiqueta-tema">PREGUNTA ${indice + 1}</span>
                <dt style="margin-bottom: 20px; font-size: 1.2rem; line-height: 1.5;">${item.pregunta}</dt>
                <form class="contenedor-opciones-radio">
            `;

            for (let i = 0; i < 4; i++) {
                const textoOp = item[`op${i}`];
                if (textoOp) {
                    contenidoHTML += `
                        <label class="opcion-radio-label">
                            <input type="radio" name="pregunta_${item.id}" value="${i}" class="input-radio-test">
                            <span class="texto-opcion">${textoOp}</span>
                        </label>
                    `;
                }
            }

            contenidoHTML += `</form>`;
            divTarjeta.innerHTML = contenidoHTML;
            contenedorColumnaUnica.appendChild(divTarjeta);
        });

        // Iconos vectoriales guardados en memoria interna para evitar fallos de rutas
        const svgCorregir = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        const svgRevisar  = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        const svgReiniciar = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>`;

        // 3. Panel global final inyectando los vectores directamente en línea
        const panelFinal = document.createElement('div');
        panelFinal.className = 'panel-final-test';
        panelFinal.innerHTML = `
            <div class="contenedor-botones-tarjeta">
                <button class="boton-tarjeta boton-finalizar-global" type="button" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                    ${svgCorregir}
                    Corregir Test 
                </button>
                <button class="boton-tarjeta boton-revisar-global" type="button" style="display: none; align-items: center; justify-content: center; gap: 8px;">
                    ${svgRevisar}
                    Revisar Respuestas
                </button>
                <button class="boton-tarjeta boton-reiniciar-global" type="button" style="display: none; align-items: center; justify-content: center; gap: 8px;">
                    ${svgReiniciar}
                    Reiniciar Test
                </button>
            </div>
            <div class="marcador-resultado-global" style="display: none;"></div>
        `;
        contenedorColumnaUnica.appendChild(panelFinal);

        const botonFinalizar = panelFinal.querySelector('.boton-finalizar-global');
        const botonRevisar = panelFinal.querySelector('.boton-revisar-global');
        const botonReiniciar = panelFinal.querySelector('.boton-reiniciar-global');
        const marcadorNota = panelFinal.querySelector('.marcador-resultado-global');

        // LÓGICA DE CORRECCIÓN
        botonFinalizar.addEventListener('click', () => {
            let aciertos = 0;
            let respondidas = 0;
            const totalPreguntas = bd_test.length;

            const tarjetas = contenedorColumnaUnica.querySelectorAll('.tarjeta-test-unica');
            
            tarjetas.forEach((tarjeta, indice) => {
                const itemBD = bd_test[indice];
                const formulario = tarjeta.querySelector('.contenedor-opciones-radio');
                const opcionSeleccionada = formulario.querySelector(`input[name="pregunta_${itemBD.id}"]:checked`);

                formulario.querySelectorAll('input').forEach(input => input.disabled = true);

                const respuestaUsuario = opcionSeleccionada ? opcionSeleccionada.value : null;
                const respuestaCorrecta = itemBD.correcta;

                if (!opcionSeleccionada) {
                    tarjeta.classList.add('tarjeta-no-respondida');
                    const etiqueta = tarjeta.querySelector('.etiqueta-tema');
                    if (etiqueta && !etiqueta.querySelector('.alerta-blanco')) {
                        etiqueta.innerHTML += ` <span class="alerta-blanco">— Sin Responder</span>`;
                    }
                } else {
                    respondidas++;
                    if (respuestaUsuario === respuestaCorrecta) aciertos++;
                }

                const labels = formulario.querySelectorAll('.opcion-radio-label');
                labels.forEach(label => {
                    const input = label.querySelector('input');
                    
                    if (input.value === respuestaCorrecta) {
                        label.classList.add('resultado-correcto');
                    } else if (respuestaUsuario && input.value === respuestaUsuario) {
                        label.classList.add('resultado-incorrecto');
                    } else {
                        label.style.opacity = "0.4";
                    }
                });
            });

            // Ocultamos finalizar y mostramos los dos nuevos botones de acción
            botonFinalizar.style.display = 'none';
            botonRevisar.style.display = 'inline-flex';
            botonReiniciar.style.display = 'inline-flex';

            // Icono de gráfica estadística SVG 
            const svgMarcador = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0; color: var(--color-termino);"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`;

            marcadorNota.style.display = "block";
            marcadorNota.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 16px; text-align: center;">
                    ${svgMarcador}
                    <h4 style="margin: 0;">Resultado del Test</h4>
                </div>
                <p style="text-align: center;">Has acertado <strong>${aciertos}</strong> de <strong>${totalPreguntas}</strong> preguntas.</p>
                <p style="font-size: 0.9rem; color: var(--color-definicion); margin-top: 8px; text-align: center;">
                    (Respondidas: ${respondidas} | Dejadas en blanco: ${totalPreguntas - respondidas})
                </p>
            `;
            
            marcadorNota.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        // LÓGICA DE REVISIÓN (Sube arriba con scroll suave sin borrar nada)
        botonRevisar.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // LÓGICA DE REINICIO
        botonReiniciar.addEventListener('click', () => {
            renderizarTest();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.addEventListener('DOMContentLoaded', renderizarTest);
})();
