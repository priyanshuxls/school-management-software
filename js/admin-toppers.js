/* =========================================
   TOPPERS ADMIN FUNCTIONALITY
========================================= */

let toppersDatabase = JSON.parse(localStorage.getItem('toppersDatabase')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initTopperForm();
    loadToppers();
});

function initTopperForm() {
    const form = document.getElementById('topperForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const topperData = {
            name: document.getElementById('studentName').value.trim(),
            class: document.getElementById('studentClass').value,
            section: document.getElementById('section').value,
            category: document.getElementById('category').value,
            percentage: parseFloat(document.getElementById('percentage').value),
            year: parseInt(document.getElementById('year').value.trim()),
            position: document.getElementById('position').value.trim(),
            rollNumber: document.getElementById('rollNumber').value.trim(),
            remarks: document.getElementById('remarks').value.trim(),
            subjects: {}
        };

        // Parse subjects JSON if provided
        const subjectsInput = document.getElementById('subjects').value.trim();
        if (subjectsInput) {
            try {
                topperData.subjects = JSON.parse(subjectsInput);
            } catch (e) {
                showMessage('topperMsg', 'error', 'Invalid JSON format for subjects. Please check and try again.');
                return;
            }
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

        try {
            // Try API first
            const response = await api.createTopper(topperData);
            showMessage('topperMsg', 'success', `Successfully added ${topperData.name} to the Board of Fame.`);
        } catch (error) {
            // Fallback to localStorage
            console.warn('API unavailable, using localStorage:', error);
            topperData.id = Date.now();
            topperData.createdAt = new Date().toISOString();
            toppersDatabase.push(topperData);
            localStorage.setItem('toppersDatabase', JSON.stringify(toppersDatabase));
            showMessage('topperMsg', 'success', `Successfully added ${topperData.name} to the Board of Fame (Local Mode).`);
        }
        
        form.reset();
        await loadToppers();

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Topper';
    });
}

async function loadToppers() {
    const container = document.getElementById('toppersList');
    
    let toppers = [];
    
    try {
        // Try API first
        toppers = await api.getToppers();
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
        toppers = JSON.parse(localStorage.getItem('toppersDatabase')) || [];
    }
    
    if (toppers.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:60px 20px; color:var(--text-muted);">
                <i class="fas fa-trophy" style="font-size:4rem; margin-bottom:16px; opacity:0.3;"></i>
                <p style="font-size:1.1rem;">No toppers added yet</p>
                <p style="font-size:0.9rem; margin-top:8px;">Add your first topper using the form above</p>
            </div>
        `;
        return;
    }

    // Define class order for sorting
    const classOrder = {
        'Nursery': 1, 'LKG': 2, 'UKG': 3,
        'I': 4, 'II': 5, 'III': 6, 'IV': 7, 'V': 8,
        'VI': 9, 'VII': 10, 'VIII': 11, 'IX': 12, 'X': 13,
        'XI - Science': 14, 'XI - Commerce': 15, 'XI - Arts': 16,
        'XII - Science': 17, 'XII - Commerce': 18, 'XII - Arts': 19
    };

    // Define position/rank order for sorting
    const getRankOrder = (position) => {
        const pos = (position || '').toLowerCase();
        if (pos.includes('1st') || pos.includes('first')) return 1;
        if (pos.includes('2nd') || pos.includes('second')) return 2;
        if (pos.includes('3rd') || pos.includes('third')) return 3;
        if (pos.includes('board topper')) return 0;
        if (pos.includes('school topper')) return 0;
        if (pos.includes('district topper')) return 0;
        if (pos.includes('state topper')) return 0;
        return 99; // Other positions go last
    };

    // Sort by class order, then by rank/position
    const sortedToppers = [...toppers].sort((a, b) => {
        // First sort by class
        const classA = classOrder[a.class] || 999;
        const classB = classOrder[b.class] || 999;
        if (classA !== classB) return classA - classB;
        
        // Then sort by rank/position (1st, 2nd, 3rd)
        const rankA = getRankOrder(a.position || a.rank);
        const rankB = getRankOrder(b.position || b.rank);
        if (rankA !== rankB) return rankA - rankB;
        
        // Finally sort by percentage (highest first)
        return b.percentage - a.percentage;
    });

    container.innerHTML = sortedToppers.map(topper => `
        <div class="glass" style="padding:20px; border-radius:14px; display:flex; align-items:center; gap:20px;">
            <div style="width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg, #fbbf24, #f59e0b); display:flex; align-items:center; justify-content:center; font-size:1.8rem; font-weight:700; color:white; flex-shrink:0;">
                ${topper.name.charAt(0)}
            </div>
            <div style="flex:1;">
                <h3 style="font-size:1.1rem; margin-bottom:4px;">${topper.name}</h3>
                <p style="color:var(--text-muted); font-size:0.85rem;">
                    ${topper.position || topper.rank} - ${topper.class}${topper.section ? ' ' + topper.section : ''}
                    ${topper.category ? ' (' + topper.category + ')' : ''}
                    ${topper.year ? ' - ' + topper.year : ''}
                </p>
                <p style="color:var(--primary); font-size:0.9rem; font-weight:600; margin-top:6px;">${topper.percentage}%</p>
                ${topper.rollNumber ? `<p style="color:var(--text-muted); font-size:0.8rem; margin-top:2px;">Roll: ${topper.rollNumber}</p>` : ''}
            </div>
            <button class="btn btn-outline btn-sm" onclick="deleteTopper(${topper.id})" style="background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.3); color:#f87171;">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `).join('');
}

async function deleteTopper(id) {
    if (!confirm('Are you sure you want to remove this topper?')) return;

    try {
        // Try API first
        await api.deleteTopper(id);
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
        toppersDatabase = toppersDatabase.filter(topper => topper.id !== id);
        localStorage.setItem('toppersDatabase', JSON.stringify(toppersDatabase));
    }
    
    await loadToppers();
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
