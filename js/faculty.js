/* =========================================
   FACULTY PAGE FUNCTIONALITY
========================================= */

document.addEventListener('DOMContentLoaded', () => {
    loadAllFaculty();
    initFacultyModalHandlers();
});

async function loadAllFaculty() {
    const container = document.getElementById('facultyGrid');
    if (!container) return;

    let staff = [];
    
    try {
        // Try API first
        staff = await api.getFaculty();
    } catch (error) {
        // Fallback to localStorage
        const facultyDatabase = JSON.parse(localStorage.getItem('facultyDatabase')) || [];
        
        if (facultyDatabase.length > 0) {
            staff = facultyDatabase;
        } else {
            // Use default faculty if none added from admin
            staff = [
                { name: 'Dr. A. K. Singh', designation: 'Principal', subject: 'M.Ed, Ph.D', icon: 'fa-user-tie', qualification: 'Ph.D in Education, M.Ed', experience: '25 years', email: 'principal@acps.edu.in', remarks: 'Visionary leader with extensive experience in educational administration and curriculum development.', priority: 1 },
                { name: 'Mrs. Sunita Sharma', designation: 'Director', subject: 'M.A. English', icon: 'fa-chalkboard-teacher', qualification: 'M.A. English Literature', experience: '20 years', email: 'director@acps.edu.in', remarks: 'Dedicated educator with a passion for English literature and student mentorship.', priority: 2 },
                { name: 'Mr. Rajesh Kumar', designation: 'School Owner', subject: 'MBA, B.Ed', icon: 'fa-user-tie', qualification: 'MBA, B.Ed', experience: '30 years', email: 'owner@acps.edu.in', remarks: 'Founder and visionary behind Amol Chand Public School with decades of experience in education.', priority: 3 },
                { name: 'Ms. Priya Verma', designation: 'Head - Mathematics', subject: 'M.Sc. Mathematics', icon: 'fa-calculator', qualification: 'M.Sc. Mathematics, B.Ed', experience: '15 years', email: 'priya.v@acps.edu.in', remarks: 'Innovative mathematics teacher known for making complex concepts accessible to students.' },
                { name: 'Dr. Amit Patel', designation: 'Head - English', subject: 'M.A. English Lit.', icon: 'fa-book', qualification: 'Ph.D in English Literature', experience: '22 years', email: 'amit.p@acps.edu.in', remarks: 'Published author and literary critic with a deep understanding of English literature.' },
                { name: 'Mrs. Kavita Singh', designation: 'Head - Social Science', subject: 'M.A. History', icon: 'fa-globe', qualification: 'M.A. History, B.Ed', experience: '16 years', email: 'kavita.s@acps.edu.in', remarks: 'Passionate historian who brings history to life through engaging teaching methods.' },
                { name: 'Mr. Vikram Malhotra', designation: 'Head - Science', subject: 'M.Sc. Chemistry', icon: 'fa-flask', qualification: 'M.Sc. Chemistry, B.Ed', experience: '18 years', email: 'vikram.m@acps.edu.in', remarks: 'Experienced chemistry teacher with a passion for practical experiments and research.' },
                { name: 'Ms. Anjali Reddy', designation: 'Head - Computer Science', subject: 'MCA, B.Tech', icon: 'fa-laptop-code', qualification: 'MCA, B.Tech Computer Science', experience: '12 years', email: 'anjali.r@acps.edu.in', remarks: 'Tech-savvy educator bringing modern programming concepts to students.' },
                { name: 'Mr. Suresh Gupta', designation: 'Sports Coordinator', subject: 'B.P.Ed, M.P.Ed', icon: 'fa-running', qualification: 'B.P.Ed, M.P.Ed', experience: '14 years', email: 'suresh.g@acps.edu.in', remarks: 'Former state-level athlete dedicated to promoting sports and physical fitness.' },
                { name: 'Mrs. Meera Iyer', designation: 'Music Teacher', subject: 'B.A. Music', icon: 'fa-music', qualification: 'B.A. Music, Diploma in Classical Music', experience: '10 years', email: 'meera.i@acps.edu.in', remarks: 'Classical music expert nurturing musical talent in students.' },
                { name: 'Mr. Aditya Rao', designation: 'Art Teacher', subject: 'B.F.A', icon: 'fa-palette', qualification: 'Bachelor of Fine Arts', experience: '11 years', email: 'aditya.r@acps.edu.in', remarks: 'Professional artist inspiring creativity and artistic expression in students.' },
                { name: 'Ms. Neha Kapoor', designation: 'Librarian', subject: 'M.Lib.Sc', icon: 'fa-book-reader', qualification: 'Master in Library Science', experience: '13 years', email: 'neha.k@acps.edu.in', remarks: 'Passionate about promoting reading culture and managing extensive library resources.' }
            ];
        }
    }

    // Sort by priority (show leadership first)
    staff.sort((a, b) => (a.priority || 999) - (b.priority || 999));

    // Store globally for modal
    window.facultyData = staff;

    // Render all faculty
    container.innerHTML = staff.map((member, index) => `
        <div class="faculty-card glass glass-card clickable" data-faculty-id="${index}">
            <div class="faculty-avatar-large">
                <i class="fas ${member.icon}"></i>
            </div>
            <h3 style="font-size:1.15rem; margin-top:14px;">${member.name}</h3>
            <p style="color:var(--primary); font-size:0.85rem; font-weight:600; margin-top:4px;">${member.designation}</p>
            <p style="color:var(--text-muted); font-size:0.8rem; margin-top:4px;">${member.subject}</p>
            <div class="topper-view-details"><i class="fas fa-arrow-right"></i> View Details</div>
        </div>
    `).join('');

    // Add click handlers
    attachFacultyClickHandlers();
}

function attachFacultyClickHandlers() {
    document.querySelectorAll('[data-faculty-id]').forEach(card => {
        card.addEventListener('click', () => {
            const facultyId = parseInt(card.dataset.facultyId);
            if (window.facultyData && window.facultyData[facultyId]) {
                showFacultyModal(window.facultyData[facultyId]);
            }
        });
    });
}

function initFacultyModalHandlers() {
    const modal = document.getElementById('facultyModal');
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');

    closeBtn.addEventListener('click', () => closeFacultyModal());
    overlay.addEventListener('click', () => closeFacultyModal());

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeFacultyModal();
        }
    });
}

function showFacultyModal(faculty) {
    const modal = document.getElementById('facultyModal');
    
    const avatarEl = document.getElementById('facultyModalAvatar');
    avatarEl.innerHTML = `<i class="fas ${faculty.icon}" style="font-size:3rem;"></i>`;
    
    document.getElementById('facultyModalName').textContent = faculty.name;
    document.getElementById('facultyModalDesignation').textContent = faculty.designation;
    
    const infoHTML = `
        <div class="faculty-info-row">
            <div class="faculty-info-icon"><i class="fas fa-graduation-cap"></i></div>
            <div class="faculty-info-content">
                <div class="faculty-info-label">Qualification</div>
                <div class="faculty-info-value">${faculty.qualification || faculty.subject}</div>
            </div>
        </div>
        <div class="faculty-info-row">
            <div class="faculty-info-icon"><i class="fas fa-briefcase"></i></div>
            <div class="faculty-info-content">
                <div class="faculty-info-label">Experience</div>
                <div class="faculty-info-value">${faculty.experience || 'Not specified'}</div>
            </div>
        </div>
        <div class="faculty-info-row">
            <div class="faculty-info-icon"><i class="fas fa-envelope"></i></div>
            <div class="faculty-info-content">
                <div class="faculty-info-label">Email</div>
                <div class="faculty-info-value">${faculty.email || 'Not available'}</div>
            </div>
        </div>
    `;
    
    document.getElementById('facultyModalInfo').innerHTML = infoHTML;
    document.getElementById('facultyModalRemarks').textContent = faculty.remarks || 'Dedicated educator committed to student success and academic excellence.';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFacultyModal() {
    const modal = document.getElementById('facultyModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}
