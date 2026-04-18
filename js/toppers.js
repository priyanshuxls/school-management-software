/* =========================================
   TOPPERS PAGE FUNCTIONALITY
========================================= */

let allToppers = [];
const currentYear = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', async () => {
    await loadAllToppers();
    initializeTopperViews();
    initializeYearSelector();
    initializeModals();
});

async function loadAllToppers() {
    try {
        // Try API first
        allToppers = await api.getToppers();
    } catch (error) {
        // Fallback to localStorage
        allToppers = JSON.parse(localStorage.getItem('toppersDatabase')) || [];
    }
}

function initializeTopperViews() {
    const buttons = document.querySelectorAll('.topper-mode-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all buttons
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Hide all views
            document.querySelectorAll('.topper-view').forEach(v => v.classList.remove('active'));
            
            // Show selected view
            const mode = btn.dataset.mode;
            const view = document.getElementById(`${mode}-view`);
            if (view) {
                view.classList.add('active');
                
                // Load data for the selected view
                if (mode === 'board') {
                    displayBoardToppers();
                } else if (mode === 'yearly') {
                    displayYearlyToppers();
                } else if (mode === 'class') {
                    displayClassToppers();
                }
            }
        });
    });
    
    // Load board toppers by default
    displayBoardToppers();
}

function initializeYearSelector() {
    const yearSelector = document.getElementById('yearSelector');
    if (!yearSelector) return;
    
    // Get unique years from toppers data
    const years = [...new Set(allToppers.map(t => t.year).filter(y => y))].sort((a, b) => b - a);
    
    // If no years in data, add current year
    if (years.length === 0) {
        years.push(currentYear);
    }
    
    // Populate year selector
    yearSelector.innerHTML = years.map(year => 
        `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`
    ).join('');
    
    // Add change event listener
    yearSelector.addEventListener('change', () => {
        displayYearlyToppers();
    });
}

function displayBoardToppers() {
    const class12Container = document.getElementById('board-class12-toppers');
    const class10Container = document.getElementById('board-class10-toppers');
    
    if (!class12Container || !class10Container) return;
    
    // Filter board toppers
    const boardToppers = allToppers.filter(t => t.category === 'board');
    
    const class12Toppers = boardToppers.filter(t => t.class && t.class.includes('XII'));
    const class10Toppers = boardToppers.filter(t => t.class && (t.class.includes('X') && !t.class.includes('XI')));
    
    if (class12Toppers.length === 0) {
        class12Container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:40px;">No Class XII board toppers added yet.</p>';
    } else {
        class12Container.innerHTML = class12Toppers.map(topper => createTopperCard(topper)).join('');
    }
    
    if (class10Toppers.length === 0) {
        class10Container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:40px;">No Class X board toppers added yet.</p>';
    } else {
        class10Container.innerHTML = class10Toppers.map(topper => createTopperCard(topper)).join('');
    }
    
    attachCardClickHandlers();
}

function displayYearlyToppers() {
    const container = document.getElementById('yearly-toppers-container');
    const yearSelector = document.getElementById('yearSelector');
    if (!container) return;
    
    const selectedYear = yearSelector ? parseInt(yearSelector.value) : currentYear;
    
    // Filter yearly toppers for selected year
    const yearlyToppers = allToppers.filter(t => 
        t.category === 'yearly' && 
        parseInt(t.year) === selectedYear
    );
    
    if (yearlyToppers.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:40px;">No yearly toppers added for this year.</p>';
        return;
    }
    
    // Group by class
    const classList = ['Nursery', 'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI - Science', 'XI - Commerce', 'XI - Arts', 'XII - Science', 'XII - Commerce', 'XII - Arts'];
    
    let html = '';
    
    classList.forEach(className => {
        const classToppers = yearlyToppers.filter(t => t.class === className);
        
        if (classToppers.length > 0) {
            // Sort by position (1st, 2nd, 3rd)
            classToppers.sort((a, b) => {
                const posA = (a.position || '').toLowerCase();
                const posB = (b.position || '').toLowerCase();
                if (posA.includes('1st')) return -1;
                if (posB.includes('1st')) return 1;
                if (posA.includes('2nd')) return -1;
                if (posB.includes('2nd')) return 1;
                return 0;
            });
            
            html += `
                <div style="margin-bottom:40px;">
                    <h3 style="font-size:1.1rem; margin-bottom:20px; color:#60a5fa;">
                        <i class="fas fa-graduation-cap" style="color:#34d399;"></i> 
                        Class ${className}
                    </h3>
                    <div class="toppers-grid">
                        ${classToppers.map(topper => createTopperCard(topper)).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    if (html === '') {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:40px;">No yearly toppers added for this year.</p>';
    } else {
        container.innerHTML = html;
    }
    
    attachCardClickHandlers();
}

function displayClassToppers() {
    const container = document.getElementById('class-toppers-container');
    if (!container) return;
    
    // Filter class toppers for current year
    const classToppers = allToppers.filter(t => 
        t.category === 'class' && 
        parseInt(t.year) === currentYear
    );
    
    if (classToppers.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:40px;">No class toppers added for current year.</p>';
        return;
    }
    
    container.innerHTML = classToppers.map(topper => createTopperCard(topper)).join('');
    attachCardClickHandlers();
}

function createTopperCard(student) {
    const hasSubjects = student.subjects && Object.keys(student.subjects).length > 0;
    const position = student.position || student.rank || 'Topper';
    
    return `
        <div class="topper-card-large glass glass-card ${hasSubjects ? 'clickable' : ''}" ${hasSubjects ? `data-student-id="${student.id}"` : ''}>
            <div class="topper-rank-badge">${position}</div>
            <div class="topper-avatar-large">${student.name.charAt(0)}</div>
            <h3 style="font-size:1.15rem; margin-top:14px;">${student.name}</h3>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-top:4px;">
                ${student.class}${student.section ? ' ' + student.section : ''}
                ${student.year ? ' - ' + student.year : ''}
            </p>
            <div class="topper-percentage-large">${student.percentage}%</div>
            ${hasSubjects ? '<div class="topper-view-details"><i class="fas fa-arrow-right"></i> View Details</div>' : ''}
        </div>
    `;
}

function attachCardClickHandlers() {
    document.querySelectorAll('.topper-card-large.clickable').forEach(card => {
        card.addEventListener('click', () => {
            const studentId = parseInt(card.dataset.studentId);
            const student = allToppers.find(s => s.id === studentId);
            if (student) {
                showStudentModal(student);
            }
        });
    });
}

function initializeModals() {
    const modal = document.getElementById('studentModal');
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');

    closeBtn.addEventListener('click', () => closeModal());
    overlay.addEventListener('click', () => closeModal());

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

function showStudentModal(student) {
    const modal = document.getElementById('studentModal');
    const position = student.position || student.rank || 'Topper';
    
    document.getElementById('modalAvatar').textContent = student.name.charAt(0);
    document.getElementById('modalName').textContent = student.name;
    document.getElementById('modalClass').textContent = `${student.class}${student.section ? ' ' + student.section : ''} - ${position}`;
    document.getElementById('modalPercentage').textContent = `${student.percentage}%`;
    document.getElementById('modalRemarks').textContent = student.remarks || 'No remarks available.';

    const marksTable = document.getElementById('modalMarks');
    
    if (student.subjects && Object.keys(student.subjects).length > 0) {
        const subjectsArray = Object.entries(student.subjects).map(([name, marks]) => ({
            name,
            marks,
            maxMarks: 100 // Default max marks
        }));
        
        const totalMarks = subjectsArray.reduce((sum, s) => sum + s.marks, 0);
        const totalMax = subjectsArray.reduce((sum, s) => sum + s.maxMarks, 0);
        
        marksTable.innerHTML = `
            <thead>
                <tr>
                    <th>Subject</th>
                    <th style="text-align:center;">Max Marks</th>
                    <th style="text-align:right;">Obtained</th>
                </tr>
            </thead>
            <tbody>
                ${subjectsArray.map(subject => `
                    <tr>
                        <td>${subject.name}</td>
                        <td style="text-align:center;">${subject.maxMarks}</td>
                        <td style="text-align:right; font-weight:600; color:#34d399;">${subject.marks}</td>
                    </tr>
                `).join('')}
                <tr style="border-top:2px solid var(--glass-border); font-weight:700;">
                    <td>Total</td>
                    <td style="text-align:center;">${totalMax}</td>
                    <td style="text-align:right; color:#fbbf24;">${totalMarks}</td>
                </tr>
            </tbody>
        `;
    } else {
        marksTable.innerHTML = '<tbody><tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding:20px;">No subject-wise marks available</td></tr></tbody>';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('studentModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}
