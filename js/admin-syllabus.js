/* =========================================
   ADMIN SYLLABUS MANAGEMENT
========================================= */

document.addEventListener('DOMContentLoaded', () => {
    initFileUpload();
    loadSyllabusList();
    
    const form = document.getElementById('syllabusForm');
    if (form) {
        form.addEventListener('submit', handleSyllabusSubmit);
    }
});

function initFileUpload() {
    const uploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('syllabusFile');
    const fileNameDisplay = document.getElementById('selectedFileName');
    
    if (!uploadArea || !fileInput) return;
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameDisplay.textContent = `Selected: ${file.name}`;
            fileNameDisplay.style.display = 'block';
        }
    });
}

async function handleSyllabusSubmit(e) {
    e.preventDefault();
    
    const className = document.getElementById('className').value;
    const category = document.getElementById('category').value;
    const session = document.getElementById('session').value;
    const description = document.getElementById('description').value;
    const subjects = document.getElementById('subjects').value;
    const fileInput = document.getElementById('syllabusFile');
    const msgDiv = document.getElementById('syllabusMsg');
    
    if (!fileInput.files[0]) {
        showMessage(msgDiv, 'Please select a PDF file', 'error');
        return;
    }
    
    const syllabusData = {
        id: Date.now().toString(),
        class_name: className,
        className: className,
        category: category,
        session: session,
        description: description,
        subjects: subjects.split(',').map(s => s.trim()),
        file_name: fileInput.files[0].name,
        file_size: (fileInput.files[0].size / 1024).toFixed(2) + ' KB',
        uploaded_date: new Date().toISOString()
    };
    
    try {
        // Try API first
        await api.createSyllabus(syllabusData);
        showMessage(msgDiv, 'Syllabus uploaded successfully!', 'success');
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
        const syllabusDatabase = JSON.parse(localStorage.getItem('syllabusDatabase')) || [];
        syllabusDatabase.push(syllabusData);
        localStorage.setItem('syllabusDatabase', JSON.stringify(syllabusDatabase));
        showMessage(msgDiv, 'Syllabus uploaded successfully! (Stored locally)', 'success');
    }
    
    // Reset form
    e.target.reset();
    document.getElementById('selectedFileName').style.display = 'none';
    
    // Reload list
    loadSyllabusList();
}

async function loadSyllabusList() {
    const container = document.getElementById('syllabusList');
    if (!container) return;
    
    let syllabusData = [];
    
    try {
        // Try API first
        const response = await api.getSyllabus();
        syllabusData = response.syllabus || [];
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
        syllabusData = JSON.parse(localStorage.getItem('syllabusDatabase')) || [];
    }
    
    if (syllabusData.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
                <i class="fas fa-folder-open" style="font-size:3rem; opacity:0.3; margin-bottom:16px;"></i>
                <p>No syllabus uploaded yet</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = syllabusData.map(item => `
        <div class="glass" style="padding:20px; margin-bottom:16px; border-radius:12px;">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
                <div style="flex:1;">
                    <h4 style="font-size:0.95rem; margin-bottom:6px;">${item.class_name || item.className}</h4>
                    <p style="font-size:0.75rem; color:var(--text-muted);">${item.session || '2025-26'}</p>
                </div>
                <button class="btn btn-sm" onclick="deleteSyllabus('${item.id}')" style="background:rgba(239,68,68,0.2); color:#fca5a5; padding:6px 12px;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            
            <p style="font-size:0.8rem; color:rgba(255,255,255,0.7); margin-bottom:10px; line-height:1.5;">
                ${item.description || 'No description'}
            </p>
            
            <div style="display:flex; align-items:center; gap:8px; font-size:0.75rem; color:var(--text-muted);">
                <i class="fas fa-file-pdf" style="color:#ef4444;"></i>
                <span>${item.file_name || 'syllabus.pdf'}</span>
                ${item.file_size ? `<span>• ${item.file_size}</span>` : ''}
            </div>
        </div>
    `).join('');
}

async function deleteSyllabus(id) {
    if (!confirm('Are you sure you want to delete this syllabus?')) return;
    
    try {
        // Try API first
        await api.deleteSyllabus(id);
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
        let syllabusDatabase = JSON.parse(localStorage.getItem('syllabusDatabase')) || [];
        syllabusDatabase = syllabusDatabase.filter(item => item.id !== id);
        localStorage.setItem('syllabusDatabase', JSON.stringify(syllabusDatabase));
    }
    
    loadSyllabusList();
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `form-status ${type}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}
