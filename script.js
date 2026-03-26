(function() {
    const STORAGE_KEY = 'bts_pro_events';
    let events = [];

    const loadData = () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            events = data ? JSON.parse(data) : [];
        } catch (e) { events = []; }
    };

    const saveData = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    };

    const updateClocks = () => {
        const now = new Date();
        const pe = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'America/Lima' });
        const kr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Seoul' });
        
        const peEl = document.getElementById('pe-time');
        const krEl = document.getElementById('kr-time');
        if (peEl) peEl.textContent = pe;
        if (krEl) krEl.textContent = kr;
    };

    // Función para manejar el reproductor de Spotify configurable
    const setupSpotifyPlayer = () => {
        const container = document.querySelector('.album-container');
        const mediaBlock = document.querySelector('.media-block');
        if (!container) return;

        const SPOTIFY_URL_KEY = 'bts_pro_spotify';
        let savedSpotifyUrl = localStorage.getItem(SPOTIFY_URL_KEY) || 'https://open.spotify.com/playlist/37i9dQZF1DX08mhnhv6g9b';

        const controlsDiv = document.getElementById('spotify-controls');
        if (!controlsDiv) return;

        const renderControls = (url) => {
            controlsDiv.innerHTML = `
                <button id="change-spotify-btn" class="spotify-control-btn" type="button">⚙️ <span>Cambiar Playlist</span></button>
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="spotify-control-link">🔗 <span>Abrir App</span></a>
            `;

            document.getElementById('change-spotify-btn').onclick = () => {
                const newLink = prompt("Pega el enlace de Spotify:", url);
                if (newLink && newLink.includes("spotify.com")) {
                    localStorage.setItem(SPOTIFY_URL_KEY, newLink);
                    window.location.reload(); 
                }
            };
        };

        renderControls(savedSpotifyUrl);
        if (mediaBlock) mediaBlock.classList.remove('is-player-active');

        container.addEventListener('click', function() {
            if (document.getElementById('spotify-player')) return; 

            let embedUrl = "";
            try {
                const urlObj = new URL(savedSpotifyUrl);
                const pathParts = urlObj.pathname.split('/').filter(p => p);
                if (pathParts.length >= 2) {
                    const type = pathParts[0]; 
                    const id = pathParts[1];
                    embedUrl = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
                }
            } catch(e) {
                embedUrl = `https://open.spotify.com/embed/playlist/37i9dQZF1DX08mhnhv6g9b?utm_source=generator`;
            }

            const iframe = document.createElement('iframe');
            iframe.id = 'spotify-player';
            iframe.src = embedUrl;
            iframe.width = "100%";
            iframe.height = "240";
            iframe.frameBorder = "0";
            iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
            iframe.loading = "lazy";
            iframe.style.border = "none";
            iframe.style.display = "block";

            container.innerHTML = '';
            container.appendChild(iframe);
            if (mediaBlock) mediaBlock.classList.add('is-player-active');
            
            // Re-renderizar controles debajo del iframe
            renderControls(savedSpotifyUrl);
        }, { once: true });
    };

    const renderCalendar = () => {
        const calDays = document.getElementById('cal-days');
        const calMonth = document.getElementById('cal-month');
        if(!calDays) return;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        
        calMonth.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        calDays.innerHTML = '';
        
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) calDays.appendChild(document.createElement('div'));

        for (let day = 1; day <= daysInMonth; day++) {
            const div = document.createElement('div');
            div.className = 'calendar-day';
            div.textContent = day;
            
            const dayEvents = events.filter(e => {
                const d = new Date(e.date);
                return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });

            if (dayEvents.length > 0) {
                div.classList.add('has-event');
                
                // Efecto Hover: Burbuja y Resaltado en Tabla
                div.addEventListener('mouseenter', (e) => {
                    // 1. Crear la burbuja (Tooltip)
                    const tooltip = document.createElement('div');
                    tooltip.id = 'calendar-tooltip';
                    tooltip.style.position = 'fixed';
                    tooltip.style.backgroundColor = 'black';
                    tooltip.style.color = 'white';
                    tooltip.style.padding = '8px 12px';
                    tooltip.style.borderRadius = '4px';
                    tooltip.style.fontSize = '0.7rem';
                    tooltip.style.zIndex = '1000';
                    tooltip.style.pointerEvents = 'none';
                    tooltip.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
                    tooltip.style.textTransform = 'uppercase';
                    tooltip.style.fontWeight = 'bold';
                    tooltip.style.maxWidth = '200px';

                    const rect = div.getBoundingClientRect();
                    tooltip.style.left = `${rect.left + rect.width / 2}px`;
                    tooltip.style.top = `${rect.top - 10}px`;
                    tooltip.style.transform = 'translate(-50%, -100%)';

                    let content = dayEvents.map(ev => `• ${ev.title}`).join('<br>');
                    tooltip.innerHTML = content;
                    document.body.appendChild(tooltip);

                    // 2. Resaltar en la tabla
                    dayEvents.forEach(ev => {
                        const row = document.querySelector(`.event-row[data-row-id="${ev.id}"]`);
                        if(row) {
                            row.style.backgroundColor = '#fff0f3';
                            row.style.borderLeft = '4px solid #ff1242';
                        }
                    });
                });

                div.addEventListener('mouseleave', () => {
                    // 1. Quitar la burbuja
                    const tooltip = document.getElementById('calendar-tooltip');
                    if (tooltip) tooltip.remove();

                    // 2. Quitar resaltado de la tabla
                    dayEvents.forEach(ev => {
                        const row = document.querySelector(`.event-row[data-row-id="${ev.id}"]`);
                        if(row) {
                            row.style.backgroundColor = '';
                            row.style.borderLeft = '';
                        }
                    });
                });
            }
            calDays.appendChild(div);
        }
    };


    const registerServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./service-worker.js').catch((error) => {
                    console.error('Service worker error:', error);
                });
            });
        }
    };

    const render = () => {
        const list = document.getElementById('events-list');
        if(!list) return;
        list.innerHTML = '';
        renderCalendar();

        if (events.length === 0) {
            list.innerHTML = `<div style="padding:60px 20px; text-align:center; color:#bbb; font-weight:900; text-transform:uppercase; font-size:0.7rem;">No hay eventos programados</div>`;
            return;
        }

        const now = new Date();

        events.forEach(ev => {
            const d = new Date(ev.date);
            const isPast = d < now;
            const day = d.getDate();
            const month = d.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
            
            const tOpt = { hour: '2-digit', minute: '2-digit', hour12: true };
            const peT = d.toLocaleTimeString('en-US', { ...tOpt, timeZone: 'America/Lima' });
            const krT = d.toLocaleTimeString('en-US', { ...tOpt, timeZone: 'Asia/Seoul' });

            const row = document.createElement('div');
            row.className = `event-row ${isPast ? 'past-event' : ''}`;
            row.setAttribute('data-row-id', ev.id); // ID para vinculación con calendario
            row.innerHTML = `
                <div class="date-col"><span>${month}</span>${day}</div>
                <div class="info-col">
                    <div class="event-name">${ev.title} ${isPast ? '<span class="past-tag">PAST</span>' : ''}</div>
                    <button class="details-trigger" data-id="${ev.id}">DETALLES</button>
                </div>
                <div class="sync-col">
                    <div class="time-pill"><span class="tag">PE</span><span>${peT}</span></div>
                    <div class="time-pill"><span class="tag">KR</span><span>${krT}</span></div>
                </div>
                <div class="action-col">
                    <button class="action-btn edit-btn" data-id="${ev.id}">✎</button>
                    <button class="action-btn delete-btn" data-id="${ev.id}">×</button>
                </div>
            `;
            list.appendChild(row);
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        registerServiceWorker();
        loadData();
        render();
        setupSpotifyPlayer();
        setInterval(updateClocks, 1000);
        updateClocks();

        const form = document.getElementById('event-form');
        const modal = document.getElementById('details-modal');

        document.getElementById('btn-toggle-form').onclick = () => {
            document.getElementById('form-title').textContent = "Nuevo Evento";
            document.getElementById('edit-id').value = "";
            document.getElementById('in-title').value = "";
            document.getElementById('in-date').value = "";
            document.getElementById('in-link').value = "";
            form.style.display = 'block';
        };

        document.getElementById('btn-cancel').onclick = () => form.style.display = 'none';

        document.getElementById('btn-save').onclick = () => {
            const title = document.getElementById('in-title').value;
            const date = document.getElementById('in-date').value;
            const link = document.getElementById('in-link').value;
            const editId = document.getElementById('edit-id').value;

            if(!title || !date) return; // Validación básica silenciosa

            if (editId) {
                const idx = events.findIndex(e => e.id == editId);
                events[idx] = { ...events[idx], title, date, link };
            } else {
                events.push({ id: Date.now(), title, date, link });
            }

            events.sort((a,b) => new Date(a.date) - new Date(b.date));
            saveData();
            render();
            form.style.display = 'none';
        };

        document.getElementById('events-list').addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            if(!id) return;

            if(e.target.classList.contains('delete-btn')) {
                events = events.filter(ev => ev.id != id);
                saveData();
                render();
            }

            if(e.target.classList.contains('edit-btn')) {
                const ev = events.find(ev => ev.id == id);
                document.getElementById('form-title').textContent = "Editar Evento";
                document.getElementById('edit-id').value = ev.id;
                document.getElementById('in-title').value = ev.title;
                document.getElementById('in-date').value = ev.date;
                document.getElementById('in-link').value = ev.link || '';
                form.style.display = 'block';
            }

            if(e.target.classList.contains('details-trigger')) {
                const ev = events.find(ev => ev.id == id);
                const d = new Date(ev.date);
                const fullDate = d.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                
                document.getElementById('modal-body').innerHTML = `
                    <h2>${ev.title}</h2>
                    <div class="detail-item"><label>Fecha Completa</label><p>${fullDate}</p></div>
                    <div class="detail-item"><label>Horario PE</label><p>${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Lima' })}</p></div>
                    <div class="detail-item"><label>Horario KR</label><p>${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Seoul' })}</p></div>
                    
                    ${ev.link ? `
                    <div class="modal-footer-actions">
                        <a href="${ev.link}" class="modal-link-btn" target="_blank">IR AL EVENTO</a>
                        <button id="btn-copy-modal" data-link="${ev.link}" class="modal-copy-btn" title="Copiar URL">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                    </div>` : ''}
                `;
                modal.style.display = 'flex';

                const copyBtn = document.getElementById('btn-copy-modal');
                if (copyBtn) {
                    copyBtn.onclick = () => {
                        const url = copyBtn.getAttribute('data-link');
                        const temp = document.createElement('input');
                        temp.value = url;
                        document.body.appendChild(temp);
                        temp.select();
                        document.execCommand('copy');
                        document.body.removeChild(temp);
                        
                        const originalSVG = copyBtn.innerHTML;
                        copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                        setTimeout(() => copyBtn.innerHTML = originalSVG, 2000);
                    };
                }
            }
        });

        document.getElementById('modal-close').onclick = () => modal.style.display = 'none';
        window.onclick = (e) => { if(e.target == modal) modal.style.display = 'none'; };
    });
})();