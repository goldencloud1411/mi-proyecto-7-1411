(function() {
    const STORAGE_KEY = 'bts_pro_events_v2';
    let events = [];

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

    const updateClocks = () => {
        const now = new Date();
        const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        
        document.getElementById('pe-time').textContent = now.toLocaleTimeString('es-PE', { ...options, timeZone: 'America/Lima' });
        document.getElementById('kr-time').textContent = now.toLocaleTimeString('ko-KR', { ...options, timeZone: 'Asia/Seoul' });
    };

    const renderCalendar = () => {
        const calDays = document.getElementById('cal-days');
        if (!calDays) return;
        calDays.innerHTML = '';
        
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
        document.getElementById('cal-month-year').textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Ajuste para lunes como primer día (0=Dom -> 6=Dom)
        let startingDay = firstDay === 0 ? 6 : firstDay - 1;

        for (let i = 0; i < startingDay; i++) {
            const empty = document.createElement('div');
            calDays.appendChild(empty);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'day-num';
            dayEl.textContent = d;
            
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            
            if (d === now.getDate()) dayEl.classList.add('today');
            
            const hasEvent = events.some(e => e.date.startsWith(dateStr));
            if (hasEvent) dayEl.classList.add('has-event');
            
            calDays.appendChild(dayEl);
        }
    };

    const renderEvents = () => {
        const list = document.getElementById('events-list');
        list.innerHTML = '';

        // Ordenar por fecha
        const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

        sorted.forEach(ev => {
            const dateObj = new Date(ev.date);
            const dateStr = dateObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
            const timeStr = dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

            const div = document.createElement('div');
            div.className = 'event-item';
            div.innerHTML = `
                <div class="event-date">${dateStr}</div>
                <div class="event-name">${ev.title}</div>
                <div class="event-time">${timeStr}</div>
                <button class="action-btn" data-id="${ev.id}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </button>
            `;
            list.appendChild(div);
        });

        // Eventos de los botones de detalle
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.onclick = () => showDetails(btn.getAttribute('data-id'));
        });
    };

    const showDetails = (id) => {
        const ev = events.find(e => e.id === id);
        if (!ev) return;

        const modal = document.getElementById('details-modal');
        const body = document.getElementById('modal-body');
        
        body.innerHTML = `
            <h2 style="margin-bottom:10px;">${ev.title}</h2>
            <p style="color:var(--bts-text-muted); margin-bottom:20px;">${new Date(ev.date).toLocaleString()}</p>
            ${ev.link ? `<a href="${ev.link}" target="_blank" style="display:block; background:var(--bts-black); color:white; text-align:center; padding:12px; border-radius:8px; text-decoration:none; font-weight:bold;">Ir al Evento</a>` : ''}
            <button id="btn-delete-event" data-id="${ev.id}" style="margin-top:20px; background:none; border:none; color:var(--bts-red); cursor:pointer; font-size:0.8rem; width:100%;">Eliminar Evento</button>
        `;
        
        modal.style.display = 'flex';
        
        document.getElementById('btn-delete-event').onclick = () => {
            if(confirm('¿Eliminar evento?')) {
                events = events.filter(e => e.id !== id);
                saveData();
                modal.style.display = 'none';
            }
        };
    };

    // Inicialización
    document.addEventListener('DOMContentLoaded', () => {
        loadData();
        renderEvents();
        renderCalendar();
        setInterval(updateClocks, 1000);
        updateClocks();

        const form = document.getElementById('event-form');
        const btnToggle = document.getElementById('btn-toggle-form');
        
        btnToggle.onclick = () => {
            form.style.display = form.style.display === 'block' ? 'none' : 'block';
        };

        document.getElementById('btn-cancel').onclick = () => form.style.display = 'none';

        document.getElementById('btn-save').onclick = () => {
            const title = document.getElementById('in-title').value;
            const date = document.getElementById('in-date').value;
            const link = document.getElementById('in-link').value;

            if (!title || !date) return alert('Título y Fecha obligatorios');

            const newEvent = {
                id: Date.now().toString(),
                title,
                date,
                link
            };

            events.push(newEvent);
            saveData();
            form.style.display = 'none';
            // Limpiar
            document.getElementById('in-title').value = '';
            document.getElementById('in-date').value = '';
            document.getElementById('in-link').value = '';
        };

        document.getElementById('modal-close').onclick = () => {
            document.getElementById('details-modal').style.display = 'none';
        };
    });

})();