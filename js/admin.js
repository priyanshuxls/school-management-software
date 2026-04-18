/* =========================================
   ADMIN PANEL FUNCTIONALITY
========================================= */

document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    initLoginForm();
    initLogout();
    loadDashboardStats();
});

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const adminName = localStorage.getItem('adminName') || 'Admin';
    
    const loginSection = document.getElementById('loginSection');
    const dashboardSection = document.getElementById('dashboardSection');
    
    if (isLoggedIn) {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        document.getElementById('adminNameDisplay').textContent = adminName;
    } else {
        loginSection.style.display = 'block';
        dashboardSection.style.display = 'none';
    }
}

function initLoginForm() {
    const form = document.getElementById('adminLoginForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value;
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        
        try {
            // Try API authentication first
            const response = await api.login(username, password);
            
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminName', response.admin?.username || 'Administrator');
            
            showMessage('loginMsg', 'success', 'Login successful! Redirecting...');
            
            setTimeout(() => {
                checkLoginStatus();
                loadDashboardStats();
            }, 1000);
        } catch (error) {
            // Fallback to local authentication for demo
            if (username === 'admin' && password === 'admin123') {
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminName', 'Administrator');
                
                showMessage('loginMsg', 'success', 'Login successful! (Demo Mode)');
                
                setTimeout(() => {
                    checkLoginStatus();
                    loadDashboardStats();
                }, 1000);
            } else {
                showMessage('loginMsg', 'error', 'Invalid username or password. Please try again.');
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        }
    });
}

function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;
    
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminName');
            checkLoginStatus();
        }
    });
}

function loadDashboardStats() {
    const resultsDatabase = JSON.parse(localStorage.getItem('resultsDatabase')) || [];
    const galleryImages = JSON.parse(localStorage.getItem('galleryImages')) || [];
    const noticesDatabase = JSON.parse(localStorage.getItem('noticesDatabase')) || [];
    const eventsDatabase = JSON.parse(localStorage.getItem('eventsDatabase')) || [];
    const filesDatabase = JSON.parse(localStorage.getItem('filesDatabase')) || [];
    const feeDatabase = JSON.parse(localStorage.getItem('feeDatabase')) || [];
    
    const totalResults = resultsDatabase.length;
    const totalGallery = galleryImages.length;
    const totalStudents = resultsDatabase.reduce((sum, r) => sum + (r.studentsCount || 0), 0);
    const totalNotices = noticesDatabase.length;
    const totalEvents = eventsDatabase.length;
    const totalFiles = filesDatabase.length;
    
    let lastUpdate = 'Never';
    if (resultsDatabase.length > 0 || galleryImages.length > 0 || noticesDatabase.length > 0 || eventsDatabase.length > 0) {
        const dates = [
            ...resultsDatabase.map(r => new Date(r.uploadDate)),
            ...galleryImages.map(g => new Date(g.uploadDate)),
            ...noticesDatabase.map(n => new Date(n.createdAt)),
            ...eventsDatabase.map(e => new Date(e.createdAt)),
            ...filesDatabase.map(f => new Date(f.uploadDate))
        ].sort((a, b) => b - a);
        
        if (dates.length > 0) {
            lastUpdate = formatRelativeTime(dates[0]);
        }
    }
    
    const statResults = document.getElementById('statResults');
    const statGallery = document.getElementById('statGallery');
    const statStudents = document.getElementById('statStudents');
    const statLastUpdate = document.getElementById('statLastUpdate');
    
    if (statResults) animateCounter(statResults, totalResults + totalNotices + totalEvents + totalFiles);
    if (statGallery) animateCounter(statGallery, totalGallery);
    if (statStudents) animateCounter(statStudents, totalStudents);
    if (statLastUpdate) statLastUpdate.textContent = lastUpdate;
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 30;
    const duration = 1000;
    const stepTime = duration / 30;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

function formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
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
