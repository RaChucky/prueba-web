document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DEL DOM ---
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const menuOverlay = document.getElementById('menuOverlay');
    const contentArea = document.getElementById('content-area');
    const navLinks = document.querySelectorAll('.nav-link');
    const dropdowns = document.querySelectorAll('.dropdown');

    // --- 1. CONTROL DEL MENÚ LATERAL (MÓVILES) ---
    function toggleSidebar() {
        if (!sidebar || !menuToggle) return;
        sidebar.classList.toggle('active');
        menuToggle.classList.toggle('is-active'); 
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }

    function closeSidebar() {
        if (!sidebar || !menuToggle) return;
        sidebar.classList.remove('active');
        menuToggle.classList.remove('is-active');
        document.body.style.overflow = '';
    }

    if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
    if (menuOverlay) menuOverlay.addEventListener('click', closeSidebar);

    // --- 2. CONTROL DE SUBMENÚS DESPLEGABLES ---
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.dropdown-btn');
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Cierra otros desplegables abiertos para mantener la barra limpia
                dropdowns.forEach(other => {
                    if (other !== dropdown) other.classList.remove('open');
                });

                dropdown.classList.toggle('open');
            });
        }
    });

    // --- 3. CARGA DINÁMICA DE SECCIONES CON DESPERTADOR DE SCRIPTS CON SOPORTE PARA ARCHIVOS EXTERNOS (.css y .js) ---
    async function cargarSeccion(nombreSeccion) {
        if (!contentArea) return;

        // Efecto visual de carga
        contentArea.innerHTML = `
            <div class="cabecera-editorial animate-pulse">
                <span class="pildora">Cargando</span>
                <h1>Cargando contenido...</h1>
                <p>Por favor, espera un momento mientras se recuperan los archivos de la sección.</p>
            </div>
        `;

        try {
            const url = `secciones/${nombreSeccion}.html`;
            const respuesta = await fetch(url);

            if (!respuesta.ok) {
                throw new Error(`Código de error: ${respuesta.status}`);
            }

            const html = await respuesta.text();
            
            // 1. Inyectamos el HTML base en la zona central
            contentArea.innerHTML = html;

            // 2. LIMPIEZA Y CARGA EXCLUSIVA DE ESTILOS DE LA SECCIÓN
            document.querySelectorAll('link[data-estilo-seccion]').forEach(el => el.remove());

            const estilos = contentArea.querySelectorAll('link[rel="stylesheet"]');
            estilos.forEach(estiloOriginal => {
                const estiloVivo = document.createElement('link');
                estiloVivo.rel = 'stylesheet';
                estiloVivo.href = estiloOriginal.href;
                estiloVivo.setAttribute('data-estilo-seccion', 'true'); // Marca para borrarlo al cambiar de página
                document.head.appendChild(estiloVivo);
            });


            // 3. CARGA SECUENCIAL ESTRICTA DE SCRIPTS (1º Datos, 2º Dibujante)
            const scripts = Array.from(contentArea.querySelectorAll('script'));
            
            for (const scriptOriginal of scripts) {
                await new Promise((resolve) => {
                    const scriptVivo = document.createElement('script');
                    
                    if (scriptOriginal.src) {
                        // Añadimos marca de tiempo para evitar bloqueos de caché
                        scriptVivo.src = scriptOriginal.src + '?v=' + Date.now();
                        scriptVivo.onload = resolve;  // Espera a que termine de cargar
                        scriptVivo.onerror = resolve; // Si falla, no congela la app
                    } else {
                        scriptVivo.textContent = scriptOriginal.textContent;
                        resolve();
                    }
                    
                    document.body.appendChild(scriptVivo);
                    scriptVivo.remove();
                });
            }

            // Desplazamiento suave al inicio de la página
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Error al cargar la sección:', error);
            contentArea.innerHTML = `
                <div class="cabecera-editorial" style="border-left: 4px solid var(--color-pregunta-incorrecta); padding-left: 16px;">
                    <span class="pildora" style="background-color: var(--bg-pregunta-incorrecta); color: var(--color-pregunta-incorrecta);">Error</span>
                    <h1>Sección en mantenimiento</h1>
                    <p>Verifica que exista el archivo en la ruta física: <code>secciones/${nombreSeccion}.html</code>.</p>
                </div>
            `;
        }
    }


    // --- 4. GESTIÓN DE ENLACES ACTIVOS Y CONTRACCIÓN ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const seccion = link.getAttribute('data-seccion');
            
            if (seccion) {
                e.preventDefault();

                // Cambiar el estado visual del elemento seleccionado
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // AUTO-CERRAR DESPLEGABLES: Si pulsamos un menú directo o submenú de otro bloque
                dropdowns.forEach(dropdown => {
                    if (!dropdown.contains(link)) {
                        dropdown.classList.remove('open');
                    }
                });

                // Carga dinámica asíncrona sin refrescar
                cargarSeccion(seccion);

                // En móviles, esconde la barra lateral automáticamente tras pulsar la opción
                if (window.innerWidth <= 700) {
                    closeSidebar();
                }
            }
        });
    });
});
