/* =========================================
   API SERVICE - Backend Integration
========================================= */

const API_BASE_URL = 'http://localhost:5000/api';

class APIService {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Clear authentication token
    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    // Get headers with authentication
    getHeaders(isFormData = false) {
        const headers = {};
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        
        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getHeaders(options.isFormData),
                    ...options.headers
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ============================================
    // AUTHENTICATION
    // ============================================

    async login(username, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (data.token) {
            this.setToken(data.token);
        }
        
        return data;
    }

    logout() {
        this.clearToken();
    }

    // ============================================
    // NOTICES
    // ============================================

    async getNotices() {
        return await this.request('/notices');
    }

    async createNotice(noticeData) {
        return await this.request('/notices', {
            method: 'POST',
            body: JSON.stringify(noticeData)
        });
    }

    async deleteNotice(id) {
        return await this.request(`/notices/${id}`, {
            method: 'DELETE'
        });
    }

    // ============================================
    // EVENTS
    // ============================================

    async getEvents() {
        return await this.request('/events');
    }

    async createEvent(eventData) {
        return await this.request('/events', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });
    }

    async deleteEvent(id) {
        return await this.request(`/events/${id}`, {
            method: 'DELETE'
        });
    }

    // ============================================
    // GALLERY
    // ============================================

    async getGalleryImages() {
        return await this.request('/gallery');
    }

    async uploadGalleryImages(formData) {
        return await this.request('/gallery', {
            method: 'POST',
            body: formData,
            isFormData: true
        });
    }

    async deleteGalleryImage(id) {
        return await this.request(`/gallery/${id}`, {
            method: 'DELETE'
        });
    }

    // ============================================
    // DOWNLOADS
    // ============================================

    async getDownloadFiles() {
        return await this.request('/downloads');
    }

    async uploadDownloadFile(formData) {
        return await this.request('/downloads', {
            method: 'POST',
            body: formData,
            isFormData: true
        });
    }

    async deleteDownloadFile(id) {
        return await this.request(`/downloads/${id}`, {
            method: 'DELETE'
        });
    }

    // ============================================
    // FEE STRUCTURE
    // ============================================

    async getFeeStructure() {
        return await this.request('/fee-structure');
    }

    async createFeeStructure(feeData) {
        return await this.request('/fee-structure', {
            method: 'POST',
            body: JSON.stringify(feeData)
        });
    }

    async deleteFeeStructure(id) {
        return await this.request(`/fee-structure/${id}`, {
            method: 'DELETE'
        });
    }

    // ============================================
    // STUDENT RESULTS
    // ============================================

    async searchResult(rollNumber, dob) {
        return await this.request('/results/search', {
            method: 'POST',
            body: JSON.stringify({ rollNumber, dob })
        });
    }

    async uploadResults(resultsData) {
        return await this.request('/results/upload', {
            method: 'POST',
            body: JSON.stringify(resultsData)
        });
    }

    // ============================================
    // ABOUT SECTION
    // ============================================

    async getAboutSection() {
        return await this.request('/about');
    }

    async updateAboutSection(aboutData) {
        return await this.request('/about', {
            method: 'PUT',
            body: JSON.stringify(aboutData)
        });
    }

    // ============================================
    // TOPPERS
    // ============================================

    async getToppers() {
        return await this.request('/toppers');
    }

    async createTopper(topperData) {
        return await this.request('/toppers', {
            method: 'POST',
            body: JSON.stringify(topperData)
        });
    }

    async deleteTopper(id) {
        return await this.request(`/toppers/${id}`, {
            method: 'DELETE'
        });
    }

    // ============================================
    // FACULTY
    // ============================================

    async getFaculty() {
        return await this.request('/faculty');
    }

    async createFaculty(facultyData) {
        return await this.request('/faculty', {
            method: 'POST',
            body: JSON.stringify(facultyData)
        });
    }

    async deleteFaculty(id) {
        return await this.request(`/faculty/${id}`, {
            method: 'DELETE'
        });
    }

    // ========================================
    // SYLLABUS ENDPOINTS
    // ========================================
    
    async getSyllabus() {
        return await this.request('/syllabus');
    }

    async createSyllabus(syllabusData) {
        return await this.request('/syllabus', {
            method: 'POST',
            body: JSON.stringify(syllabusData)
        });
    }

    async deleteSyllabus(id) {
        return await this.request(`/syllabus/${id}`, {
            method: 'DELETE'
        });
    }
}

// Create global API instance
const api = new APIService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIService, api };
}
