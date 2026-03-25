(function() {
    const STORAGE_KEY = 'bts_pro_events';
    let events = [];

    // Cargar datos
    const loadData = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            events = data ? JSON.parse(data) : [];
        } catch (e) { events = []; }
    };

    const saveData = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
        renderEvents();
        renderCalendar();
    };

    // Relojes
    const updateClocks = () => {
        const now = new Date();
        const pe = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Lima' });
        const kr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' });
        
        document.getElementById('pe-time').textContent = pe;
        document.getElementById('kr-time').textContent = kr;
    };

    // Renderizar lista de eventos
    const renderEvents = () => {
        const list = document.getElementById('events-list');
        list.innerHTML = '';

        // Ordenar por fecha
        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        events.forEach((ev, index) => {
            const d = new Date(ev.date);
            const day = d.getDate();
            const month = d.toLocaleString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
            
            const timePE = d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
            const dKR = new Date(d.getTime() + (14 * 60 * 60 * 1000)); // Peru a Korea (+14h aprox, simplificado)
            const timeKR = dKR.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

            const row = document.createElement('div');
            row.className = 'event-row';
            row.innerHTML = `
                <div class="date-col">${day}<span>${month}</span></div>
                <div class="info-col">
                    <div class="event-name">${ev.title}</div>
                    <button class="details-trigger" data-index="${index}">Ver Detalles</button>
                </div>
                <div class="sync-col">
                    <div class="time-pill"><span class="tag">PE</span> ${timePE}</div>
                    <div class="time-pill"><span class="tag">KR</span> ${timeKR}</div>
                </div>
                <div class="action-col">
                    <button class="delete-btn" data-index="${index}" style="background:none; border:none; cursor:pointer;">🗑️</button>
                </div>
            `;
            list.appendChild(row);
        });

        // Botones de borrar
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = (e) => {
                const idx = e.target.closest('button').dataset.index;
                events.splice(idx, 1);
                saveData();
            };
        });

        // Botones de detalles
        document.querySelectorAll('.details-trigger').forEach(btn => {
            btn.onclick = (e) => showModal(e.target.dataset.index);
        });
    };

    // Modal
    const showModal = (idx) => {
        const ev = events[idx];
        const modal = document.getElementById('details-modal');
        const body = document.getElementById('modal-body');
        body.innerHTML = `
            <h2>${ev.title}</h2>
            <p><strong>Fecha:</strong> ${new Date(ev.date).toLocaleString()}</p>
            <p style="margin-top:10px; font-size:0.8rem; color:#666;">Evento oficial de BTS. No olvides sintonizar a tiempo.</p>
        `;
        modal.style.display = 'flex';
    };

    // Calendario simple
    const renderCalendar = () => {
        const now = new Date();
        const monthEl = document.getElementById('cal-month');
        const daysGrid = document.getElementById('cal-days');
        
        monthEl.textContent = now.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
        daysGrid.innerHTML = '';

        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
        const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        // Espacios vacíos
        for (let i = 0; i < firstDay; i++) {
            const div = document.createElement('div');
            daysGrid.appendChild(div);
        }

        for (let d = 1; d <= totalDays; d++) {
            const div = document.createElement('div');
            div.className = 'calendar-day';
            div.textContent = d;

            // Marcar si hay evento este día
            const hasEv = events.some(e => {
                const ed = new Date(e.date);
                return ed.getDate() === d && ed.getMonth() === now.getMonth();
            });

            if (hasEv) div.classList.add('has-event');
            daysGrid.appendChild(div);
        }
    };

    // Spotify Toggle (Imagen a Reproductor)
    const setupSpotify = () => {
        const albumContainer = document.getElementById('album-container');
        albumContainer.onclick = () => {
            albumContainer.innerHTML = `<iframe style="border-radius:12px" src="https://open.spotify.com/embed/playlist/37i9dQZF1DX08m99p99vly?utm_source=generator" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
        };
    };

    // Lógica del Formulario (ARREGLADA)
    const initForm = () => {
        const btnToggle = document.getElementById('btn-toggle-form');
        const form = document.getElementById('event-form');
        const btnSave = document.getElementById('btn-save');
        const btnCancel = document.getElementById('btn-cancel');

        btnToggle.onclick = () => {
            form.style.display = form.style.display === 'block' ? 'none' : 'block';
        };

        btnCancel.onclick = () => {
            form.style.display = 'none';
        };

        btnSave.onclick = () => {
            const title = document.getElementById('in-title').value;
            const date = document.getElementById('in-date').value;

            if (title && date) {
                events.push({ title, date });
                saveData();
                form.style.display = 'none';
                document.getElementById('in-title').value = '';
                document.getElementById('in-date').value = '';
            }
        };
    };

    // Cerrar modal
    document.getElementById('modal-close').onclick = () => {
        document.getElementById('details-modal').style.display = 'none';
    };

    // Inicio
    window.onload = () => {
        loadData();
        renderEvents();
        renderCalendar();
        setupSpotify();
        initForm();
        updateClocks();
        setInterval(updateClocks, 1000);
    };
})();