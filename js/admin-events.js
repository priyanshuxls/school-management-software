/* =========================================
   EVENTS ADMIN FUNCTIONALITY
========================================= */

let eventsDatabase = [];

document.addEventListener('DOMContentLoaded', () => {
    initEventForm();
    loadEvents();
});

function initEventForm() {
    const form = document.getElementById('eventForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const eventData = {
            name: document.getElementById('eventName').value.trim(),
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            location: document.getElementById('eventLocation').value.trim(),
            description: document.getElementById('eventDescription').value.trim(),
            category: document.getElementById('eventCategory').value,
            badgeColor: document.getElementById('eventBadgeColor').value
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';

        try {
            // Try API first
            await api.createEvent(eventData);
            showMessage('eventMsg', 'success', 'Event created successfully!');
        } catch (error) {
            // Fallback to localStorage
            console.warn('API unavailable, using localStorage:', error);
            const localEvents = JSON.parse(localStorage.getItem('eventsDatabase')) || [];
            localEvents.push({
                id: Date.now(),
                ...eventData,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('eventsDatabase', JSON.stringify(localEvents));
            showMessage('eventMsg', 'success', 'Event created successfully! (Local Mode)');
        } finally {
            form.reset();
            await loadEvents();
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Create Event';
        }
    });
}

async function loadEvents() {
    const container = document.getElementById('eventsList');
    
    try {
        // Try API first
        const response = await api.getEvents();
        eventsDatabase = response.events || [];
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
        eventsDatabase = JSON.parse(localStorage.getItem('eventsDatabase')) || [];
    }
    
    if (eventsDatabase.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
                <i class="fas fa-calendar-times" style="font-size:2.5rem; margin-bottom:12px; opacity:0.3;"></i>
                <p style="font-size:0.9rem;">No events scheduled yet</p>
            </div>
        `;
        return;
    }

    const sortedEvents = [...eventsDatabase].sort((a, b) => new Date(a.date) - new Date(b.date));

    const badgeColors = {
        green: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
        amber: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
        pink: { bg: 'rgba(236,72,153,0.15)', color: '#f472b6' },
        blue: { bg: 'rgba(37,99,235,0.15)', color: '#60a5fa' }
    };

    container.innerHTML = sortedEvents.map(event => {
        const badge = badgeColors[event.badgeColor || event.badge_color] || badgeColors.blue;
        
        return `
            <div class="notice-item" style="margin-bottom:12px;">
                <span class="notice-date" style="background:${badge.bg}; color:${badge.color};">${formatDateShort(event.date)}</span>
                <div style="flex:1;">
                    <div class="notice-text">${event.name}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                        ${event.location} &middot; ${event.time}
                    </div>
                </div>
                <button class="btn-icon-delete" data-id="${event.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.btn-icon-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            deleteEvent(id);
        });
    });
}

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
        // Try API first
        await api.deleteEvent(id);
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
        const localEvents = JSON.parse(localStorage.getItem('eventsDatabase')) || [];
        const filtered = localEvents.filter(e => e.id !== id);
        localStorage.setItem('eventsDatabase', JSON.stringify(filtered));
    }
    
    await loadEvents();
}

function formatDateShort(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short'
    }).format(date);
}

function showMessage(elementId, type, message) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.style.display = 'flex';
    element.className = `form-status ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    element.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}
