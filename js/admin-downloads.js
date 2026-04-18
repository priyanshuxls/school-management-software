/* =========================================
   DOWNLOADS ADMIN FUNCTIONALITY
========================================= */

let filesDatabase = JSON.parse(localStorage.getItem('filesDatabase')) || [];
let selectedFile = null;

document.addEventListener('DOMContentLoaded', () => {
    initFileUpload();
    initDownloadForm();
    loadFiles();
    initFileFilter();
});

function initFileUpload() {
    const uploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('uploadFile');
    const fileNameDisplay = document.getElementById('selectedFileName');

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            fileNameDisplay.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
            fileNameDisplay.style.display = 'block';
        }
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary)';
        uploadArea.style.background = 'rgba(37,99,235,0.1)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--glass-border)';
        uploadArea.style.background = 'var(--glass-bg)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--glass-border)';
        uploadArea.style.background = 'var(--glass-bg)';
        
        const file = e.dataTransfer.files[0];
        if (file) {
            selectedFile = file;
            fileInput.files = e.dataTransfer.files;
            fileNameDisplay.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
            fileNameDisplay.style.display = 'block';
        }
    });
}

function initDownloadForm() {
    const form = document.getElementById('downloadForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            showMessage('downloadMsg', 'error', 'Please select a file to upload.');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            showMessage('downloadMsg', 'error', 'File size must be less than 10MB.');
            return;
        }

        const fileData = {
            id: Date.now(),
            title: document.getElementById('fileTitle').value.trim(),
            category: document.getElementById('fileCategory').value,
            description: document.getElementById('fileDescription').value.trim(),
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            fileType: selectedFile.type || getFileType(selectedFile.name),
            fileUrl: URL.createObjectURL(selectedFile),
            uploadDate: new Date().toISOString()
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

        setTimeout(() => {
            filesDatabase.push(fileData);
            localStorage.setItem('filesDatabase', JSON.stringify(filesDatabase));

            showMessage('downloadMsg', 'success', 'File uploaded successfully!');
            
            form.reset();
            selectedFile = null;
            document.getElementById('selectedFileName').style.display = 'none';
            loadFiles();

            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-upload"></i> Upload File';
        }, 1000);
    });
}

function loadFiles() {
    const container = document.getElementById('filesList');
    
    if (filesDatabase.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
                <i class="fas fa-folder-open" style="font-size:2.5rem; margin-bottom:12px; opacity:0.3;"></i>
                <p style="font-size:0.9rem;">No files uploaded yet</p>
            </div>
        `;
        return;
    }

    const sortedFiles = [...filesDatabase].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    container.innerHTML = sortedFiles.map(file => {
        const iconClass = getFileIcon(file.fileName);
        const iconColor = getFileIconColor(file.fileName);
        
        return `
            <div class="resource-card glass glass-card" style="padding:16px 18px; margin-bottom:12px;" data-category="${file.category}">
                <div class="resource-icon ${iconColor}">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div style="flex:1;">
                    <div style="font-weight:600; font-size:0.92rem;">${file.title}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                        ${file.fileName} &middot; ${formatFileSize(file.fileSize)}
                    </div>
                    ${file.description ? `<div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">${file.description}</div>` : ''}
                </div>
                <div style="display:flex; gap:8px; align-items:center;">
                    <a href="${file.fileUrl}" download="${file.fileName}" class="btn btn-sm" style="text-decoration:none;">
                        <i class="fas fa-download"></i>
                    </a>
                    <button class="btn-icon-delete" data-id="${file.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.btn-icon-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            deleteFile(id);
        });
    });
}

function initFileFilter() {
    const buttons = document.querySelectorAll('[data-file-filter]');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.fileFilter;

            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const items = document.querySelectorAll('.resource-card');
            items.forEach(item => {
                const shouldShow = category === 'all' || item.dataset.category === category;
                item.style.display = shouldShow ? 'flex' : 'none';
            });
        });
    });
}

function deleteFile(id) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    filesDatabase = filesDatabase.filter(f => f.id !== id);
    localStorage.setItem('filesDatabase', JSON.stringify(filesDatabase));
    loadFiles();
}

function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
        pdf: 'fa-file-pdf',
        doc: 'fa-file-word',
        docx: 'fa-file-word',
        xls: 'fa-file-excel',
        xlsx: 'fa-file-excel',
        ppt: 'fa-file-powerpoint',
        pptx: 'fa-file-powerpoint'
    };
    return icons[ext] || 'fa-file-alt';
}

function getFileIconColor(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pink';
    if (ext === 'doc' || ext === 'docx') return 'blue';
    if (ext === 'xls' || ext === 'xlsx') return 'green';
    return 'amber';
}

function getFileType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const types = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    return types[ext] || 'application/octet-stream';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
