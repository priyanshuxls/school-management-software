/* =========================================
   NOTICE BOARD ADMIN FUNCTIONALITY
========================================= */

let noticesDatabase = [];

document.addEventListener('DOMContentLoaded', () => {
    initNoticeForm();
    loadNotices();
});

function initNoticeForm() {
    const form = document.getElementById('noticeForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const noticeData = {
            title: document.getElementById('noticeTitle').value.trim(),
            category: document.getElementById('noticeCategory').value,
            date: document.getElementById('noticeDate').value,
            description: document.getElementById('noticeDescription').value.trim(),
            priority: document.getElementById('noticePriority').value,
            isNew: document.getElementById('noticeIsNew').checked
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';

        try {
            // Try API first
            await api.createNotice(noticeData);
            showMessage('noticeMsg', 'success', 'Notice published successfully!');
        } catch (error) {
            // Fallback to localStorage
            console.warn('API unavailable, using localStorage:', error);
            const localNotices = JSON.parse(localStorage.getItem('noticesDatabase')) || [];
            localNotices.push({
                id: Date.now(),
                ...noticeData,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('noticesDatabase', JSON.stringify(localNotices));
            showMessage('noticeMsg', 'success', 'Notice published successfully! (Local Mode)');
        } finally {
            form.reset();
            await loadNotices();
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publish Notice';
        }
    });
}

async function loadNotices() {
    const container = document.getElementById('noticesList');
    
    try {
        // Try API first
        const response = await api.getNotices();
        noticesDatabase = response.notices || [];
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
        noticesDatabase = JSON.parse(localStorage.getItem('noticesDatabase')) || [];
    }
    
    if (noticesDatabase.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
                <i class="fas fa-inbox" style="font-size:2.5rem; margin-bottom:12px; opacity:0.3;"></i>
                <p style="font-size:0.9rem;">No notices published yet</p>
            </div>
        `;
        return;
    }

    const sortedNotices = [...noticesDatabase].sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));

    container.innerHTML = sortedNotices.map(notice => {
        const priorityColors = {
            normal: 'rgba(96,165,250,0.2)',
            high: 'rgba(245,158,11,0.2)',
            urgent: 'rgba(239,68,68,0.2)'
        };
        
        const priorityTextColors = {
            normal: '#60a5fa',
            high: '#fbbf24',
            urgent: '#fca5a5'
        };

        return `
            <div class="notice-admin-item glass" style="padding:16px; margin-bottom:12px; border-radius:12px; border:1px solid var(--glass-border); background:${priorityColors[notice.priority]};">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                    <div style="flex:1;">
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                            <span style="font-size:0.7rem; padding:4px 8px; border-radius:12px; background:rgba(37,99,235,0.2); color:#60a5fa; text-transform:uppercase; font-weight:600;">${notice.category}</span>
                            ${notice.isNew || notice.is_new ? '<span class="badge-new">New</span>' : ''}
                            <span style="font-size:0.7rem; padding:4px 8px; border-radius:12px; background:${priorityColors[notice.priority]}; color:${priorityTextColors[notice.priority]}; text-transform:uppercase; font-weight:600;">${notice.priority}</span>
                        </div>
                        <h4 style="font-size:0.95rem; margin-bottom:6px;">${notice.title}</h4>
                        <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:8px;">${notice.description}</p>
                        <p style="font-size:0.72rem; color:var(--text-muted);">
                            <i class="fas fa-calendar"></i> ${formatDate(notice.date)}
                        </p>
                    </div>
                    <button class="btn-icon-delete" data-id="${notice.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.btn-icon-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            deleteNotice(id);
        });
    });
}

async function deleteNotice(id) {
    if (!confirm('Are you sure you want to delete this notice?')) return;

    try {
        // Try API first
        await api.deleteNotice(id);
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
        const localNotices = JSON.parse(localStorage.getItem('noticesDatabase')) || [];
        const filtered = localNotices.filter(n => n.id !== id);
        localStorage.setItem('noticesDatabase', JSON.stringify(filtered));
    }
    
    await loadNotices();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
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
