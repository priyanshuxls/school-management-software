/* =========================================
   FACULTY ADMIN FUNCTIONALITY
========================================= */

let facultyDatabase = JSON.parse(localStorage.getItem('facultyDatabase')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initFacultyForm();
    loadFaculty();
});

function initFacultyForm() {
    const form = document.getElementById('facultyForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const facultyData = {
            name: document.getElementById('facultyName').value.trim(),
            designation: document.getElementById('designation').value.trim(),
            subject: document.getElementById('subject').value.trim(),
            icon: document.getElementById('icon').value,
            qualification: document.getElementById('qualification')?.value.trim() || document.getElementById('subject').value.trim(),
            experience: document.getElementById('experience')?.value.trim() || 'Not specified',
            email: document.getElementById('email')?.value.trim() || 'Not available',
            remarks: document.getElementById('facultyRemarks')?.value.trim() || 'Dedicated educator committed to student success and academic excellence.'
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

        try {
            // Try API first
            const response = await api.createFaculty(facultyData);
            showMessage('facultyMsg', 'success', `Successfully added ${facultyData.name} to the faculty list.`);
        } catch (error) {
            // Fallback to localStorage
            console.warn('API unavailable, using localStorage:', error);
            facultyData.id = Date.now();
            facultyData.createdAt = new Date().toISOString();
            facultyDatabase.push(facultyData);
            localStorage.setItem('facultyDatabase', JSON.stringify(facultyDatabase));
            showMessage('facultyMsg', 'success', `Successfully added ${facultyData.name} to the faculty list (Local Mode).`);
        }
        
        form.reset();
        await loadFaculty();

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Faculty Member';
    });
}

async function loadFaculty() {
    const container = document.getElementById('facultyList');
    
    let faculty = [];
    
    try {
        // Try API first
        faculty = await api.getFaculty();
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
        faculty = JSON.parse(localStorage.getItem('facultyDatabase')) || [];
    }
    
    if (faculty.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--text-muted);">
                <i class="fas fa-chalkboard-teacher" style="font-size:4rem; margin-bottom:16px; opacity:0.3;"></i>
                <p style="font-size:1.1rem;">No faculty members added yet</p>
                <p style="font-size:0.9rem; margin-top:8px;">Add your first faculty member using the form above</p>
            </div>
        `;
        return;
    }

    // Sort by newest first (createdAt or id)
    const sortedFaculty = [...faculty].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || 0);
        const dateB = new Date(b.createdAt || b.created_at || 0);
        return dateB - dateA || b.id - a.id;
    });

    container.innerHTML = sortedFaculty.map(member => `
        <div class="glass glass-card" style="padding:24px; text-align:center; position:relative;">
            <button onclick="deleteFaculty(${member.id})" style="position:absolute; top:12px; right:12px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#f87171; padding:6px 10px; border-radius:8px; cursor:pointer; font-size:0.8rem; transition:all 0.2s;">
                <i class="fas fa-trash"></i>
            </button>
            <div style="width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg, var(--primary), var(--secondary)); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:1.5rem; color:white;">
                <i class="fas ${member.icon}"></i>
            </div>
            <h3 style="font-size:1rem; margin-bottom:6px;">${member.name}</h3>
            <p style="color:var(--primary); font-size:0.85rem; font-weight:600; margin-bottom:4px;">${member.designation}</p>
            <p style="color:var(--text-muted); font-size:0.8rem;">${member.subject}</p>
        </div>
    `).join('');
}

async function deleteFaculty(id) {
    if (!confirm('Are you sure you want to remove this faculty member?')) return;

    try {
        // Try API first
        await api.deleteFaculty(id);
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
        facultyDatabase = facultyDatabase.filter(member => member.id !== id);
        localStorage.setItem('facultyDatabase', JSON.stringify(facultyDatabase));
    }
    
    await loadFaculty();
}

function showMessage(elementId, type, message) {
    const element = document.getElementById(elementId);
    element.style.display = 'flex';
    element.className = `form-status ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    element.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}
