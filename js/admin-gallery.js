/* =========================================
   GALLERY ADMIN FUNCTIONALITY
========================================= */

let selectedFiles = [];
let galleryImages = JSON.parse(localStorage.getItem('galleryImages')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initFileUpload();
    initGalleryForm();
    loadGalleryImages();
    initGalleryFilter();
    initImageViewer();
});

function initFileUpload() {
    const uploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('imageFiles');

    uploadArea.addEventListener('click', () => fileInput.click());

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
        
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        handleFileSelection(files);
    });

    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleFileSelection(files);
    });
}

function handleFileSelection(files) {
    const validFiles = files.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        return isImage && isValidSize;
    });

    selectedFiles = [...selectedFiles, ...validFiles];
    displayImagePreviews();
}

function displayImagePreviews() {
    const container = document.getElementById('imagePreviewContainer');
    
    if (selectedFiles.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = selectedFiles.map((file, index) => `
        <div class="image-preview-item">
            <img src="${URL.createObjectURL(file)}" alt="Preview ${index + 1}">
            <button type="button" class="image-preview-remove" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
            <div class="image-preview-name">${file.name}</div>
        </div>
    `).join('');

    container.querySelectorAll('.image-preview-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            selectedFiles.splice(index, 1);
            displayImagePreviews();
        });
    });
}

function initGalleryForm() {
    const form = document.getElementById('galleryUploadForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (selectedFiles.length === 0) {
            showMessage('uploadMsg', 'error', 'Please select at least one image to upload.');
            return;
        }

        const formData = new FormData();
        
        // Add all images to FormData
        selectedFiles.forEach(file => {
            formData.append('images', file);
        });
        
        // Add other form fields
        formData.append('category', document.getElementById('eventCategory').value);
        formData.append('eventName', document.getElementById('eventName').value);
        formData.append('eventDate', document.getElementById('eventDate').value);
        formData.append('photographer', document.getElementById('photographerName').value);
        formData.append('description', document.getElementById('imageDescription').value);

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

        try {
            // Try to upload to backend API
            const response = await fetch('http://localhost:5000/api/gallery', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const uploadedImages = await response.json();
                
                // Also save to localStorage as backup
                galleryImages = JSON.parse(localStorage.getItem('galleryImages')) || [];
                uploadedImages.forEach(img => {
                    galleryImages.push(img);
                });
                localStorage.setItem('galleryImages', JSON.stringify(galleryImages));

                showMessage('uploadMsg', 'success', `Successfully uploaded ${selectedFiles.length} image(s) to the gallery.`);
                
                form.reset();
                selectedFiles = [];
                displayImagePreviews();
                loadGalleryImages();
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.warn('API upload failed, saving to localStorage:', error);
            
            // Fallback: Save to localStorage with base64 encoding
            const promises = selectedFiles.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const imageData = {
                            id: Date.now() + Math.random(),
                            category: document.getElementById('eventCategory').value,
                            eventName: document.getElementById('eventName').value,
                            eventDate: document.getElementById('eventDate').value,
                            photographer: document.getElementById('photographerName').value,
                            description: document.getElementById('imageDescription').value,
                            fileName: file.name,
                            fileSize: file.size,
                            fileUrl: e.target.result, // Base64 data URL
                            thumbnail: e.target.result,
                            uploadDate: new Date().toISOString()
                        };
                        resolve(imageData);
                    };
                    reader.readAsDataURL(file);
                });
            });

            const imageDataArray = await Promise.all(promises);
            galleryImages = JSON.parse(localStorage.getItem('galleryImages')) || [];
            galleryImages.push(...imageDataArray);
            localStorage.setItem('galleryImages', JSON.stringify(galleryImages));

            showMessage('uploadMsg', 'success', `Successfully uploaded ${selectedFiles.length} image(s) to the gallery (offline mode).`);
            
            form.reset();
            selectedFiles = [];
            displayImagePreviews();
            loadGalleryImages();
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Images';
    });
}

async function loadGalleryImages() {
    const container = document.getElementById('adminGalleryGrid');
    
    // Try to load from API first
    try {
        const response = await fetch('http://localhost:5000/api/gallery');
        if (response.ok) {
            const apiImages = await response.json();
            galleryImages = apiImages;
            
            // Also update localStorage
            localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
        } else {
            throw new Error('API not available');
        }
    } catch (error) {
        console.warn('API unavailable, using localStorage:', error);
        galleryImages = JSON.parse(localStorage.getItem('galleryImages')) || [];
    }
    
    if (galleryImages.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:60px 20px; color:var(--text-muted);">
                <i class="fas fa-images" style="font-size:4rem; margin-bottom:16px; opacity:0.3;"></i>
                <p style="font-size:1.1rem;">No images uploaded yet</p>
                <p style="font-size:0.9rem; margin-top:8px;">Upload your first event images using the form above</p>
            </div>
        `;
        return;
    }

    // Sort by newest first (uploadDate or id)
    const sortedImages = [...galleryImages].sort((a, b) => {
        const dateA = new Date(a.uploadDate || a.upload_date || a.created_at || 0);
        const dateB = new Date(b.uploadDate || b.upload_date || b.created_at || 0);
        return dateB - dateA || b.id - a.id;
    });

    container.innerHTML = sortedImages.map(image => {
        // Handle both API URLs and base64 data URLs
        const imageUrl = image.fileUrl || image.thumbnail;
        const eventName = image.eventName || image.event_name || 'Untitled';
        const category = image.category || 'general';
        const eventDate = image.eventDate || image.event_date || new Date().toISOString();
        
        return `
        <div class="admin-gallery-item" data-cat="${category}" data-img-src="${imageUrl}" data-img-caption="${eventName}">
            <img src="${imageUrl}" alt="${eventName}" loading="lazy">
            <div class="admin-gallery-overlay">
                <div class="admin-gallery-info">
                    <h4>${eventName}</h4>
                    <p>${category}</p>
                    <p style="font-size:0.75rem; margin-top:4px;">${formatDate(eventDate)}</p>
                </div>
                <button class="admin-gallery-delete" data-id="${image.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `}).join('');

    // Add click handlers for image viewer
    container.querySelectorAll('.admin-gallery-item').forEach(item => {
        const img = item.querySelector('img');
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            const imgSrc = item.dataset.imgSrc;
            const caption = item.dataset.imgCaption;
            console.log('Image clicked:', imgSrc, caption); // Debug log
            openImageViewer(imgSrc, caption);
        });
    });

    container.querySelectorAll('.admin-gallery-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const imageId = btn.dataset.id;
            deleteImage(imageId);
        });
    });
}

async function deleteImage(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
        // Try to delete from API
        const response = await fetch(`http://localhost:5000/api/gallery/${imageId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Also remove from localStorage
            galleryImages = galleryImages.filter(img => img.id != imageId);
            localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
            loadGalleryImages();
        } else {
            throw new Error('API delete failed');
        }
    } catch (error) {
        console.warn('API unavailable, deleting from localStorage:', error);
        
        // Fallback: Delete from localStorage only
        galleryImages = galleryImages.filter(img => img.id != imageId);
        localStorage.setItem('galleryImages', JSON.stringify(galleryImages));
        loadGalleryImages();
    }
}

function initGalleryFilter() {
    const buttons = document.querySelectorAll('[data-gallery-filter]');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.galleryFilter;

            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const items = document.querySelectorAll('.admin-gallery-item');
            items.forEach(item => {
                const shouldShow = category === 'all' || item.dataset.cat === category;
                item.style.display = shouldShow ? 'block' : 'none';
            });
        });
    });
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
    element.style.display = 'flex';
    element.className = `form-status ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    element.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Image Viewer Functionality
let imageViewer, imageViewerImg, imageViewerCaption, imageViewerClose;

function initImageViewer() {
    imageViewer = document.getElementById('imageViewer');
    imageViewerImg = document.getElementById('imageViewerImg');
    imageViewerCaption = document.getElementById('imageViewerCaption');
    imageViewerClose = document.getElementById('imageViewerClose');

    if (!imageViewer || !imageViewerImg || !imageViewerClose) {
        console.warn('Image viewer elements not found');
        return;
    }

    // Event listeners
    imageViewerClose.addEventListener('click', closeImageViewer);
    imageViewer.addEventListener('click', (e) => {
        if (e.target === imageViewer) {
            closeImageViewer();
        }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageViewer.classList.contains('active')) {
            closeImageViewer();
        }
    });
}

function openImageViewer(imgSrc, caption) {
    if (!imageViewer || !imageViewerImg) {
        console.warn('Image viewer not initialized');
        return;
    }

    imageViewerImg.src = imgSrc;
    if (caption && imageViewerCaption) {
        imageViewerCaption.textContent = caption;
        imageViewerCaption.style.display = 'block';
    } else if (imageViewerCaption) {
        imageViewerCaption.style.display = 'none';
    }
    imageViewer.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeImageViewer() {
    if (!imageViewer) return;
    
    imageViewer.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
        if (imageViewerImg) {
            imageViewerImg.src = '';
        }
    }, 300);
}
