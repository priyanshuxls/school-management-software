/* =========================================
   SYLLABUS PAGE
========================================= */

document.addEventListener('DOMContentLoaded', () => {
    loadSyllabus();
    initSyllabusFilter();
});

async function loadSyllabus() {
    const container = document.getElementById('syllabusList');
    const noSyllabus = document.getElementById('noSyllabus');
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
    
    // If no syllabus from admin, use default data
    if (syllabusData.length === 0) {
        syllabusData = getDefaultSyllabus();
    }

    if (syllabusData.length === 0) {
        container.style.display = 'none';
        noSyllabus.style.display = 'block';
        return;
    }

    container.innerHTML = syllabusData.map(item => {
        const iconClass = getSyllabusIcon(item.class_name || item.className);
        const colorClass = getSyllabusColor(item.class_name || item.className);
        
        return `
            <div class="glass glass-card syllabus-card" data-category="${item.category}" style="padding:24px; transition:all 0.3s ease;">
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                    <div class="resource-icon ${colorClass}" style="width:50px; height:50px; display:flex; align-items:center; justify-content:center; font-size:1.3rem;">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div style="flex:1;">
                        <h3 style="font-size:1rem; margin-bottom:4px;">${item.class_name || item.className}</h3>
                        <p style="font-size:0.75rem; color:var(--text-muted);">${item.session || '2025-26'}</p>
                    </div>
                </div>
                
                <p style="font-size:0.85rem; color:rgba(255,255,255,0.8); margin-bottom:16px; line-height:1.6;">
                    ${item.description || 'Complete syllabus and curriculum details'}
                </p>
                
                <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
                    ${(item.subjects || ['All Subjects']).slice(0, 3).map(subject => `
                        <span style="padding:4px 10px; background:rgba(37,99,235,0.15); border:1px solid rgba(37,99,235,0.25); border-radius:12px; font-size:0.75rem;">
                            ${subject}
                        </span>
                    `).join('')}
                    ${(item.subjects || []).length > 3 ? `
                        <span style="padding:4px 10px; background:rgba(236,72,153,0.15); border:1px solid rgba(236,72,153,0.25); border-radius:12px; font-size:0.75rem;">
                            +${(item.subjects || []).length - 3} more
                        </span>
                    ` : ''}
                </div>
                
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-sm" onclick="downloadSyllabus('${item.id || item.class_name}')" style="flex:1; justify-content:center; font-size:0.85rem;">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="viewSyllabus('${item.id || item.class_name}')" style="padding:8px 16px;">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function initSyllabusFilter() {
    const filterButtons = document.querySelectorAll('[data-syllabus-filter]');
    const syllabusCards = document.querySelectorAll('.syllabus-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-syllabus-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter cards
            let visibleCount = 0;
            syllabusCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Show/hide no results message
            const noSyllabus = document.getElementById('noSyllabus');
            const container = document.getElementById('syllabusList');
            
            if (visibleCount === 0) {
                container.style.display = 'none';
                noSyllabus.style.display = 'block';
            } else {
                container.style.display = 'grid';
                noSyllabus.style.display = 'none';
            }
        });
    });
}

function getSyllabusIcon(className) {
    const name = className.toLowerCase();
    if (name.includes('nursery') || name.includes('kg')) return 'fa-baby';
    if (name.includes('1') || name.includes('2') || name.includes('3') || name.includes('4') || name.includes('5')) return 'fa-child';
    if (name.includes('6') || name.includes('7') || name.includes('8')) return 'fa-book-reader';
    if (name.includes('9') || name.includes('10')) return 'fa-graduation-cap';
    if (name.includes('11') || name.includes('12')) return 'fa-user-graduate';
    return 'fa-book';
}

function getSyllabusColor(className) {
    const name = className.toLowerCase();
    if (name.includes('nursery') || name.includes('kg')) return 'pink';
    if (name.includes('1') || name.includes('2') || name.includes('3') || name.includes('4') || name.includes('5')) return 'green';
    if (name.includes('6') || name.includes('7') || name.includes('8')) return 'blue';
    if (name.includes('9') || name.includes('10')) return 'amber';
    if (name.includes('11') || name.includes('12')) return 'purple';
    return 'blue';
}

function downloadSyllabus(id) {
    // Simulate download
    alert(`Downloading syllabus for ${id}...\n\nNote: This is a demo. In production, this would download the actual PDF file.`);
}

function viewSyllabus(id) {
    // Simulate view
    alert(`Opening syllabus preview for ${id}...\n\nNote: This is a demo. In production, this would open the PDF in a new tab.`);
}

function getDefaultSyllabus() {
    return [
        {
            id: 'class-1',
            class_name: 'Class 1',
            category: 'primary',
            session: '2025-26',
            description: 'Foundation level curriculum focusing on basic literacy, numeracy, and environmental awareness.',
            subjects: ['English', 'Hindi', 'Mathematics', 'EVS', 'Art & Craft']
        },
        {
            id: 'class-2',
            class_name: 'Class 2',
            category: 'primary',
            session: '2025-26',
            description: 'Building on foundational skills with enhanced reading, writing, and problem-solving.',
            subjects: ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer', 'Art']
        },
        {
            id: 'class-3',
            class_name: 'Class 3',
            category: 'primary',
            session: '2025-26',
            description: 'Intermediate primary level with introduction to science concepts and social studies.',
            subjects: ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer', 'GK']
        },
        {
            id: 'class-4',
            class_name: 'Class 4',
            category: 'primary',
            session: '2025-26',
            description: 'Advanced primary curriculum with focus on analytical thinking and creativity.',
            subjects: ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer', 'GK']
        },
        {
            id: 'class-5',
            class_name: 'Class 5',
            category: 'primary',
            session: '2025-26',
            description: 'Upper primary level preparing students for middle school transition.',
            subjects: ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer', 'GK']
        },
        {
            id: 'class-6',
            class_name: 'Class 6',
            category: 'middle',
            session: '2025-26',
            description: 'Introduction to separate science and social science subjects.',
            subjects: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer']
        },
        {
            id: 'class-7',
            class_name: 'Class 7',
            category: 'middle',
            session: '2025-26',
            description: 'Middle school curriculum with enhanced focus on conceptual understanding.',
            subjects: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer']
        },
        {
            id: 'class-8',
            class_name: 'Class 8',
            category: 'middle',
            session: '2025-26',
            description: 'Pre-secondary level preparing for board examination pattern.',
            subjects: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer']
        },
        {
            id: 'class-9',
            class_name: 'Class 9',
            category: 'secondary',
            session: '2025-26',
            description: 'CBSE Board curriculum for Class IX with comprehensive subject coverage.',
            subjects: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'IT']
        },
        {
            id: 'class-10',
            class_name: 'Class 10',
            category: 'secondary',
            session: '2025-26',
            description: 'Board examination year with complete CBSE Class X syllabus.',
            subjects: ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'IT']
        },
        {
            id: 'class-11-science',
            class_name: 'Class 11 - Science',
            category: 'senior',
            session: '2025-26',
            description: 'Senior secondary science stream with PCM/PCB options.',
            subjects: ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science']
        },
        {
            id: 'class-11-commerce',
            class_name: 'Class 11 - Commerce',
            category: 'senior',
            session: '2025-26',
            description: 'Commerce stream focusing on business, economics, and accountancy.',
            subjects: ['English', 'Accountancy', 'Business Studies', 'Economics', 'Mathematics']
        },
        {
            id: 'class-12-science',
            class_name: 'Class 12 - Science',
            category: 'senior',
            session: '2025-26',
            description: 'Final year science curriculum preparing for competitive exams.',
            subjects: ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science']
        },
        {
            id: 'class-12-commerce',
            class_name: 'Class 12 - Commerce',
            category: 'senior',
            session: '2025-26',
            description: 'Final year commerce curriculum for board examinations.',
            subjects: ['English', 'Accountancy', 'Business Studies', 'Economics', 'Mathematics']
        }
    ];
}
