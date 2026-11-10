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

    // --- 3. CARGA DINÁMICA DE SECCIONES CON DESPERTADOR DE SCRIPTS ---
    async function cargarSeccion(nombreSeccion) {
        if (!contentArea) return;

        // Visual de carga simétrico
        contentArea.innerHTML = `
            <div class="cabecera-editorial animate-pulse">
                <span class="pildora">Cargando</span>
                <h1>Cargando contenido...</h1>
                <p>Por favor, espera un momento mientras se recuperan los datos del simulador.</p>
            </div>
        `;

        try {
            const url = `secciones/${nombreSeccion}.html`;
            const respuesta = await fetch(url);

            if (!respuesta.ok) {
                throw new Error(`Código de error: ${respuesta.status}`);
            }

            const html = await respuesta.text();
            contentArea.innerHTML = html;
            
            // --- EL TRUCO MAESTRO: DESPERTADOR DE SCRIPTS ---
            // Buscamos todas las etiquetas <script> que han entrado en el contenedor
            const scriptsInyectados = contentArea.querySelectorAll('script');
            
            scriptsInyectados.forEach(scriptOriginal => {
                // Creamos una nueva etiqueta script limpia y viva
                const scriptVivo = document.createElement('script');
                
                // Le copiamos el código interno que tú has programado en tu sección
                scriptVivo.textContent = scriptOriginal.textContent;
                
                // Si tu script llamara a un archivo externo (ej: src="..."), también lo clona
                if (scriptOriginal.src) scriptVivo.src = scriptOriginal.src;
                
                // Lo incrustamos en el cuerpo del documento para forzar al navegador a ejecutarlo
                document.body.appendChild(scriptVivo);
                
                // Lo eliminamos inmediatamente después para no guarrear el HTML final
                scriptVivo.remove();
            });

            // Scroll suave automático al inicio del nuevo contenido
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error('Error al cargar la sección:', error);
            contentArea.innerHTML = `
                <div class="cabecera-editorial" style="border-left: 4px solid var(--color-pregunta-incorrecta); padding-left: 16px;">
                    <span class="pildora" style="background-color: var(--bg-pregunta-incorrecta); color: var(--color-pregunta-incorrecta);">Error</span>
                    <h1>Vista no encontrada</h1>
                    <p>No se pudo inyectar el archivo de forma dinámica. Verifica que exista la ruta física: <code>secciones/${nombreSeccion}.html</code>.</p>
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
