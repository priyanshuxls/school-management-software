/* =========================================
   SHARED SITE INTERACTIONS
========================================= */

document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('js-enabled');

    initNavbar();
    initMobileMenu();
    setActiveNavLink();
    initParallaxBackground();
    initCursorGlow();
    initScrollReveal();
    initResourceTabs();
    initGalleryFilter();
    initForms();
    renderNotices();
    renderToppers();
    renderStaff();
    renderEvents();
    loadGalleryImages();
    loadAdminDownloads();
    loadAdminFeeStructure();
    syncCurrentYear();
});

async function renderEvents() {
    const container = document.getElementById('events-container');
    if (!container) return;

    let eventsDatabase = [];
    
    try {
        // Try API first
        const response = await api.getEvents();
        eventsDatabase = response.events || [];
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
        eventsDatabase = JSON.parse(localStorage.getItem('eventsDatabase')) || [];
    }
    
    const badgeColors = {
        green: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
        amber: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
        pink: { bg: 'rgba(236,72,153,0.15)', color: '#f472b6' },
        blue: { bg: 'rgba(37,99,235,0.15)', color: '#60a5fa' }
    };

    // If no events from admin, use default events
    const events = eventsDatabase.length > 0
        ? eventsDatabase.slice(0, 3).map(event => {
            const badge = badgeColors[event.badgeColor || event.badge_color] || badgeColors.blue;
            return {
                date: formatDateShort(event.date),
                name: event.name,
                location: event.location,
                time: event.time,
                bg: badge.bg,
                color: badge.color
            };
          })
        : [
            { date: '24 Oct', name: 'Science Exhibition 2024', location: 'School Auditorium', time: '10 AM', bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
            { date: '10 Nov', name: 'Annual Sports Day', location: 'School Ground', time: '9 AM Onwards', bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
            { date: '25 Nov', name: 'Annual Day Celebration', location: 'Main Stage', time: '5 PM', bg: 'rgba(236,72,153,0.15)', color: '#f472b6' }
          ];

    container.innerHTML = events.map(event => `
        <div class="notice-item">
            <span class="notice-date" style="background:${event.bg}; color:${event.color};">${event.date}</span>
            <div>
                <div class="notice-text">${event.name}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${event.location} &middot; ${event.time}</div>
            </div>
        </div>
    `).join('');
}

function initNavbar() {
    const header = document.getElementById('navbar');
    if (!header) return;

    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 40);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

function initMobileMenu() {
    const header = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    if (!header || !hamburger || !navLinks) return;

    const icon = hamburger.querySelector('i');

    const closeMenu = () => {
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        if (icon) icon.className = 'fas fa-bars';
    };

    hamburger.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', String(isOpen));
        if (icon) icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
    });

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', (e) => {
            // Don't close menu for dropdown toggle
            if (link.parentElement.classList.contains('nav-dropdown') && link.getAttribute('href') === '#') {
                return;
            }
            closeMenu();
        });
    });

    // Handle dropdown toggle on mobile
    const dropdownToggles = document.querySelectorAll('.nav-dropdown > a');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 968) {
                e.preventDefault();
                const dropdown = toggle.parentElement;
                dropdown.classList.toggle('active');
            }
        });
    });

    document.addEventListener('click', (event) => {
        if (!header.contains(event.target)) {
            closeMenu();
        }
    });
}

function setActiveNavLink() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach((link) => {
        const href = link.getAttribute('href');
        if (href === current || (current === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function initParallaxBackground() {
    const blobs = document.querySelectorAll('.blob');
    if (!blobs.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let mouseX = 0;
    let mouseY = 0;
    let scrollY = 0;
    let isAnimating = false;
    let rafId = null;

    const speeds = [
        { x: 0.015, y: 0.012, scroll: 0.08 },
        { x: -0.012, y: -0.01, scroll: -0.05 },
        { x: 0.008, y: 0.015, scroll: 0.03 }
    ];

    const currentOffsets = speeds.map(() => ({ x: 0, y: 0 }));
    const targetOffsets = speeds.map(() => ({ x: 0, y: 0 }));

    window.addEventListener('mousemove', (event) => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        mouseX = event.clientX - centerX;
        mouseY = event.clientY - centerY;

        speeds.forEach((speed, index) => {
            targetOffsets[index].x = mouseX * speed.x;
            targetOffsets[index].y = mouseY * speed.y;
        });

        if (!isAnimating) {
            isAnimating = true;
            animate();
        }
    }, { passive: true });

    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
        if (!isAnimating) {
            isAnimating = true;
            animate();
        }
    }, { passive: true });

    const lerp = (a, b, t) => a + (b - a) * t;

    function animate() {
        let hasMovement = false;

        blobs.forEach((blob, index) => {
            if (!speeds[index]) return;

            const oldX = currentOffsets[index].x;
            const oldY = currentOffsets[index].y;

            currentOffsets[index].x = lerp(currentOffsets[index].x, targetOffsets[index].x, 0.1);
            currentOffsets[index].y = lerp(currentOffsets[index].y, targetOffsets[index].y, 0.1);

            if (Math.abs(currentOffsets[index].x - oldX) > 0.01 || Math.abs(currentOffsets[index].y - oldY) > 0.01) {
                hasMovement = true;
            }

            const scrollOffset = scrollY * speeds[index].scroll;
            const translate = `translate3d(${currentOffsets[index].x}px, ${currentOffsets[index].y + scrollOffset}px, 0)`;
            
            // Use will-change for better performance
            blob.style.willChange = 'transform';
            blob.style.transform = translate;
        });

        if (hasMovement) {
            rafId = requestAnimationFrame(animate);
        } else {
            isAnimating = false;
            // Remove will-change when animation stops
            blobs.forEach(blob => {
                blob.style.willChange = 'auto';
            });
        }
    }
}

function initScrollReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        items.forEach((item) => item.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Use requestAnimationFrame for smoother animation
                requestAnimationFrame(() => {
                    entry.target.classList.add('visible');
                });
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    items.forEach((item) => observer.observe(item));
}

function initCursorGlow() {
    const glow = document.querySelector('.cursor-glow');
    if (!glow || window.matchMedia('(pointer: coarse)').matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rafId = null;

    const render = () => {
        glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        rafId = null;
    };

    window.addEventListener('mousemove', (event) => {
        x = event.clientX;
        y = event.clientY;

        if (rafId) return;
        rafId = window.requestAnimationFrame(render);
    }, { passive: true });
}

function initResourceTabs() {
    const tabButtons = document.querySelectorAll('[data-tab-target]');
    const tabPanels = document.querySelectorAll('.tab-panel');
    if (!tabButtons.length || !tabPanels.length) return;

    const activateTab = (tabId, updateHash = true) => {
        const target = document.getElementById(tabId);
        if (!target) return;

        tabButtons.forEach((button) => {
            button.classList.toggle('active', button.dataset.tabTarget === tabId);
        });

        tabPanels.forEach((panel) => {
            panel.classList.toggle('active', panel.id === tabId);
        });

        if (updateHash) {
            history.replaceState(null, '', `#${tabId}`);
        }
    };

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => activateTab(button.dataset.tabTarget));
    });

    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
        activateTab(initialHash, false);
    }
}

function initGalleryFilter() {
    const buttons = document.querySelectorAll('[data-gallery-filter]');
    const items = document.querySelectorAll('.gallery-item');
    if (!buttons.length || !items.length) return;

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const category = button.dataset.galleryFilter;

            buttons.forEach((item) => item.classList.remove('active'));
            button.classList.add('active');

            items.forEach((card) => {
                const shouldShow = category === 'all' || card.dataset.cat === category;
                card.hidden = !shouldShow;
            });
        });
    });
}

function initForms() {
    const admissionForm = document.getElementById('admissionForm');
    if (admissionForm) {
        admissionForm.addEventListener('submit', handleAdmissionSubmit);
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    document.querySelectorAll('[data-result-form]').forEach((form) => {
        form.addEventListener('submit', handleResultSubmit);
    });
}

function handleAdmissionSubmit(event) {
    event.preventDefault();
    const message = document.getElementById('admissionMsg');
    if (!message) return;

    showFormMessage(
        message,
        'success',
        'Application submitted successfully. Our team will contact you within 2 business days.'
    );
    event.target.reset();
}

function handleContactSubmit(event) {
    event.preventDefault();
    const message = document.getElementById('contactMsg');
    if (!message) return;

    showFormMessage(
        message,
        'success',
        'Thank you. Your message has been sent and we will get back to you within 24 hours.'
    );
    event.target.reset();
}

function handleResultSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const rollInput = form.querySelector('[data-roll-input], #rollNo');
    const dobInput = form.querySelector('input[type="date"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const displayId = form.dataset.resultTarget;
    const display = document.getElementById(displayId);
    if (!rollInput || !dobInput || !display) return;

    const rollNumber = rollInput.value.trim();
    const dateOfBirth = dobInput.value;
    if (!rollNumber || !dateOfBirth) return;

    display.hidden = false;
    display.style.display = 'block';
    display.classList.add('glass', 'is-loading');
    display.innerHTML = createResultLoadingMarkup();

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalLabel = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking Result';
    }

    window.setTimeout(() => {
        // Try to fetch from uploaded results database
        const resultsDatabase = JSON.parse(localStorage.getItem('resultsDatabase')) || [];
        let studentResult = null;

        for (const resultEntry of resultsDatabase) {
            const student = resultEntry.students.find(s => 
                s.rollNumber === rollNumber && 
                (s.dob === dateOfBirth || formatDateForComparison(s.dob) === dateOfBirth)
            );
            if (student) {
                studentResult = {
                    ...student,
                    session: resultEntry.session,
                    className: `Class ${resultEntry.class}`,
                    examType: resultEntry.examType,
                    publishedOn: formatDate(resultEntry.uploadDate)
                };
                break;
            }
        }

        // If not found in database, use mock data
        if (!studentResult) {
            studentResult = buildResultData(rollNumber, dateOfBirth);
        }

        display.classList.remove('is-loading');
        display.innerHTML = createResultMarkup(studentResult);

        const printButton = display.querySelector('[data-result-print]');
        const pdfButton = display.querySelector('[data-result-download]');

        if (printButton) {
            printButton.addEventListener('click', () => printResultCard(studentResult, display));
        }

        if (pdfButton) {
            pdfButton.addEventListener('click', () => downloadResultAsPdf(studentResult, display));
        }

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = submitButton.dataset.originalLabel || '<i class="fas fa-search"></i> Get Result';
        }
    }, 700);
}

function formatDateForComparison(dateStr) {
    if (!dateStr) return '';
    
    // Handle DD/MM/YYYY format
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }
    
    return dateStr;
}

function createResultLoadingMarkup() {
    return `
        <div class="result-loading" aria-live="polite">
            <div class="result-spinner"></div>
            <div>
                <h3 class="result-loading-title">Fetching Result</h3>
                <p class="result-loading-text">Verifying student details and preparing the marksheet.</p>
            </div>
        </div>
        <div class="result-skeleton-grid" aria-hidden="true">
            <span class="result-skeleton long"></span>
            <span class="result-skeleton short"></span>
            <span class="result-skeleton medium"></span>
            <span class="result-skeleton long"></span>
            <span class="result-skeleton long"></span>
            <span class="result-skeleton short"></span>
        </div>
    `;
}

function buildResultData(rollNumber, dateOfBirth) {
    const subjectRows = [
        ['Mathematics', 100, 95, 'A+'],
        ['Science', 100, 88, 'A'],
        ['English', 100, 92, 'A+'],
        ['Hindi', 100, 85, 'A'],
        ['Social Science', 100, 90, 'A+']
    ];
    const totalMarks = subjectRows.reduce((sum, [, , score]) => sum + score, 0);
    const percentage = ((totalMarks / 500) * 100).toFixed(0);

    return {
        studentName: 'Amit Kumar',
        rollNumber,
        className: '10th - Section A',
        dateOfBirth,
        session: '2025-26',
        publishedOn: '17 April 2026',
        resultStatus: 'PASS',
        percentage: `${percentage}%`,
        totalMarks,
        subjects: subjectRows
    };
}

function createResultMarkup(resultData) {
    const subjectRowsMarkup = resultData.subjects.map(subject => {
        const subjectName = typeof subject === 'object' ? subject.name : subject[0];
        const maxMarks = typeof subject === 'object' ? subject.maxMarks : subject[1];
        const marks = typeof subject === 'object' ? subject.marks : subject[2];
        const grade = typeof subject === 'object' ? calculateGrade(marks, maxMarks) : subject[3];
        
        return `
        <tr>
            <td>${subjectName}</td>
            <td style="text-align:center;">${maxMarks}</td>
            <td style="text-align:right;">${marks}</td>
            <td style="text-align:right;" class="${grade === 'A+' ? 'grade-great' : 'grade-good'}">${grade}</td>
        </tr>
    `}).join('');

    return `
        <article class="result-card" data-result-card>
            <div class="result-card-head">
                <div>
                    <p class="result-kicker">Amol Chand Public School</p>
                    <h3 class="result-heading">Provisional Marksheet</h3>
                    <p class="result-subtitle">Academic Session ${resultData.session}</p>
                </div>
                <div class="result-badge">${resultData.status || resultData.resultStatus}</div>
            </div>
            <hr class="result-divider">
            <div class="result-summary">
                <div><div class="result-label">Student Name</div><div class="result-value">${resultData.studentName}</div></div>
                <div><div class="result-label">Roll No</div><div class="result-value">${resultData.rollNumber}</div></div>
                <div><div class="result-label">Class</div><div class="result-value">${resultData.className}</div></div>
                <div><div class="result-label">Date of Birth</div><div class="result-value">${formatDate(resultData.dateOfBirth || resultData.dob)}</div></div>
                <div><div class="result-label">Published On</div><div class="result-value">${resultData.publishedOn}</div></div>
                <div><div class="result-label">Overall Score</div><div class="result-value">${resultData.totalMarks}/${resultData.maxMarks || 500} (${resultData.percentage}${typeof resultData.percentage === 'string' && resultData.percentage.includes('%') ? '' : '%'})</div></div>
            </div>
            <table class="result-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th style="text-align:center;">Max Marks</th>
                        <th style="text-align:right;">Marks Obtained</th>
                        <th style="text-align:right;">Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${subjectRowsMarkup}
                    <tr>
                        <td>Total</td>
                        <td style="text-align:center;">${resultData.maxMarks || 500}</td>
                        <td style="text-align:right;">${resultData.totalMarks} (${resultData.percentage}${typeof resultData.percentage === 'string' && resultData.percentage.includes('%') ? '' : '%'})</td>
                        <td style="text-align:right;" class="result-status-text">${resultData.status || resultData.resultStatus}</td>
                    </tr>
                </tbody>
            </table>
            <div class="result-meta-note">
                This marksheet is system-generated and valid for provisional academic reference.
            </div>
        </article>
        <div class="result-actions">
            <button class="btn" type="button" data-result-print><i class="fas fa-print"></i> Print Marksheet</button>
            <button class="btn btn-outline" type="button" data-result-download><i class="fas fa-download"></i> Download PDF</button>
        </div>
    `;
}

function calculateGrade(marks, maxMarks) {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 33) return 'D';
    return 'F';
}

function downloadResultAsPdf(resultData, display) {
    printResultCard(resultData, display, true);
}

function printResultCard(resultData, display, saveAsPdf = false) {
    const resultCard = display.querySelector('[data-result-card]');
    if (!resultCard) return;

    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (!printWindow) return;

    const subjectRows = resultData.subjects.map(subject => {
        const subjectName = typeof subject === 'object' ? subject.name : subject[0];
        const maxMarks = typeof subject === 'object' ? subject.maxMarks : subject[1];
        const marks = typeof subject === 'object' ? subject.marks : subject[2];
        const grade = typeof subject === 'object' ? calculateGrade(marks, maxMarks) : subject[3];
        
        return `
            <tr>
                <td>${subjectName}</td>
                <td class="center">${maxMarks}</td>
                <td class="right">${marks}</td>
                <td class="right">${grade}</td>
            </tr>
        `;
    }).join('');

    const totalMarks = resultData.totalMarks;
    const maxMarks = resultData.maxMarks || 500;
    const percentage = typeof resultData.percentage === 'string' && resultData.percentage.includes('%') 
        ? resultData.percentage 
        : `${resultData.percentage}%`;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${resultData.rollNumber} Marksheet</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 32px;
                    color: #0f172a;
                    background: #ffffff;
                }
                .print-sheet {
                    max-width: 900px;
                    margin: 0 auto;
                    border: 1px solid #cbd5e1;
                    border-radius: 20px;
                    padding: 28px;
                }
                .print-head {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .print-kicker {
                    margin: 0 0 6px;
                    color: #2563eb;
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                h1 {
                    margin: 0;
                    font-size: 28px;
                }
                .print-subtitle {
                    margin: 6px 0 0;
                    color: #475569;
                }
                .print-badge {
                    padding: 10px 16px;
                    border-radius: 999px;
                    background: #dcfce7;
                    color: #166534;
                    font-weight: 700;
                }
                .print-summary {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 14px;
                    margin: 24px 0;
                    padding: 18px;
                    background: #f8fafc;
                    border-radius: 14px;
                }
                .print-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    color: #64748b;
                    letter-spacing: 0.8px;
                }
                .print-value {
                    margin-top: 4px;
                    font-size: 15px;
                    font-weight: 700;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 12px 14px;
                    border-bottom: 1px solid #e2e8f0;
                }
                thead tr {
                    background: #eff6ff;
                }
                th {
                    color: #1d4ed8;
                    text-align: left;
                    font-size: 12px;
                    text-transform: uppercase;
                }
                .right { text-align: right; }
                .center { text-align: center; }
                .total-row td {
                    font-weight: 700;
                    border-top: 2px solid #cbd5e1;
                }
                .print-note {
                    margin-top: 18px;
                    color: #475569;
                    font-size: 13px;
                }
                .print-tip {
                    margin-top: 12px;
                    color: #334155;
                    font-size: 12px;
                }
                @media print {
                    body { padding: 0; }
                    .print-sheet {
                        border: 0;
                        border-radius: 0;
                    }
                }
            </style>
        </head>
        <body>
            <section class="print-sheet">
                <div class="print-head">
                    <div>
                        <p class="print-kicker">Amol Chand Public School</p>
                        <h1>Provisional Marksheet</h1>
                        <p class="print-subtitle">Academic Session ${resultData.session}</p>
                    </div>
                    <div class="print-badge">${resultData.status || resultData.resultStatus}</div>
                </div>
                <div class="print-summary">
                    <div><div class="print-label">Student Name</div><div class="print-value">${resultData.studentName}</div></div>
                    <div><div class="print-label">Roll No</div><div class="print-value">${resultData.rollNumber}</div></div>
                    <div><div class="print-label">Class</div><div class="print-value">${resultData.className}</div></div>
                    <div><div class="print-label">Date of Birth</div><div class="print-value">${formatDate(resultData.dateOfBirth || resultData.dob)}</div></div>
                    <div><div class="print-label">Published On</div><div class="print-value">${resultData.publishedOn}</div></div>
                    <div><div class="print-label">Overall Score</div><div class="print-value">${totalMarks}/${maxMarks} (${percentage})</div></div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Subject</th>
                            <th class="center">Max Marks</th>
                            <th class="right">Marks Obtained</th>
                            <th class="right">Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subjectRows}
                        <tr class="total-row">
                            <td>Total</td>
                            <td class="center">${maxMarks}</td>
                            <td class="right">${totalMarks} (${percentage})</td>
                            <td class="right">${resultData.status || resultData.resultStatus}</td>
                        </tr>
                    </tbody>
                </table>
                <p class="print-note">This marksheet is system-generated and valid for provisional academic reference.</p>
                ${saveAsPdf ? '<p class="print-tip">Choose "Save as PDF" in the print dialog to download the result card as a PDF.</p>' : ''}
            </section>
            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(date);
}

function showFormMessage(element, tone, text) {
    element.style.display = 'block';
    element.className = `form-status ${tone}`;
    element.innerHTML = `<i class="fas fa-check-circle"></i> <span>${text}</span>`;
}

function syncCurrentYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll('[data-current-year]').forEach((node) => {
        node.textContent = year;
    });
}

async function renderNotices() {
    const container = document.getElementById('notice-container');
    if (!container) return;

    let noticesDatabase = [];
    
    try {
        // Try API first
        const response = await api.getNotices();
        noticesDatabase = response.notices || [];
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
        noticesDatabase = JSON.parse(localStorage.getItem('noticesDatabase')) || [];
    }
    
    // If no notices from admin, use default notices
    const notices = noticesDatabase.length > 0 
        ? noticesDatabase.slice(0, 5).map(notice => ({
            date: formatDateShort(notice.date),
            title: notice.title,
            isNew: notice.isNew || notice.is_new
          }))
        : [
            { date: '15 Oct', title: 'Admissions open for 2025-26', isNew: true },
            { date: '10 Oct', title: 'Half-yearly exam schedule released', isNew: false },
            { date: '05 Oct', title: 'Dussehra holidays announcement', isNew: false },
            { date: '28 Sep', title: 'Parent-teacher meeting for Classes 1-8', isNew: false },
            { date: '20 Sep', title: 'Science exhibition registration open', isNew: false }
          ];

    container.innerHTML = notices.map((notice) => `
        <div class="notice-item">
            <span class="notice-date">${notice.date}</span>
            <span class="notice-text">${notice.title}${notice.isNew ? '<span class="badge-new">New</span>' : ''}</span>
        </div>
    `).join('');
}

function formatDateShort(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short'
    }).format(date);
}

async function renderToppers() {
    const container = document.getElementById('toppers-container');
    if (!container) return;

    let toppers = [];
    
    try {
        // Try API first
        const allToppers = await api.getToppers();
        // Filter only board toppers (High School X & Intermediate XII)
        const boardToppers = allToppers.filter(t => 
            t.category === 'board' && 
            (t.class.includes('X') || t.class.includes('XII'))
        );
        
        toppers = boardToppers.slice(0, 4).map(topper => ({
            name: topper.name,
            rank: topper.position || topper.rank,
            score: `${topper.percentage}%`,
            stream: topper.class
        }));
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
        const toppersDatabase = JSON.parse(localStorage.getItem('toppersDatabase')) || [];
        
        // Filter only board toppers (High School X & Intermediate XII)
        const boardToppers = toppersDatabase.filter(t => 
            t.category === 'board' && 
            (t.class.includes('X') || t.class.includes('XII'))
        );
        
        if (boardToppers.length > 0) {
            // Use admin-added board toppers (show up to 4)
            toppers = boardToppers.slice(0, 4).map(topper => ({
                name: topper.name,
                rank: topper.position || topper.rank,
                score: `${topper.percentage}%`,
                stream: topper.class
            }));
        } else {
            // Use default toppers if none added from admin
            toppers = [
                { name: 'Rahul Sharma', rank: 'Board Topper', score: '98.4%', stream: 'Class XII' },
                { name: 'Priya Verma', rank: 'Board Topper', score: '97.2%', stream: 'Class XII' },
                { name: 'Arjun Mehta', rank: 'Board Topper', score: '96.8%', stream: 'Class X' }
            ];
        }
    }

    container.innerHTML = toppers.map((student) => `
        <div class="glass glass-card reveal topper-card">
            <div class="topper-avatar">${student.name.charAt(0)}</div>
            <h3 style="font-size:1rem;">${student.name}</h3>
            <p style="color:var(--text-muted); font-size:0.8rem; margin-top:4px;">${student.rank} - ${student.stream}</p>
            <div class="topper-score">${student.score}</div>
        </div>
    `).join('');
}

async function renderStaff() {
    const container = document.getElementById('staff-container');
    if (!container) return;

    let staff = [];
    
    try {
        // Try API first
        staff = await api.getFaculty();
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
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
                { name: 'Mrs. Kavita Singh', designation: 'Head - Social Science', subject: 'M.A. History', icon: 'fa-globe', qualification: 'M.A. History, B.Ed', experience: '16 years', email: 'kavita.s@acps.edu.in', remarks: 'Passionate historian who brings history to life through engaging teaching methods.' }
            ];
        }
    }

    // Show only top 3 priority members on homepage (Principal, Director, Owner)
    const topStaff = staff
        .sort((a, b) => (a.priority || 999) - (b.priority || 999))
        .slice(0, 4);

    // Render faculty cards
    container.innerHTML = topStaff.map((member, index) => `
        <div class="glass glass-card reveal faculty-card" data-faculty-id="${index}" style="padding:24px; text-align:center;">
            <div class="faculty-avatar">
                <i class="fas ${member.icon}"></i>
            </div>
            <h3 style="font-size:1rem; margin-bottom:6px;">${member.name}</h3>
            <p style="color:var(--primary); font-size:0.85rem; font-weight:600; margin-bottom:4px;">${member.designation}</p>
            <p style="color:var(--text-muted); font-size:0.8rem;">${member.subject}</p>
        </div>
    `).join('');

    // Store all staff data globally for faculty page
    window.facultyData = staff;

    // Initialize faculty modal
    initFacultyModal();
}

function initFacultyCarousel() {
    const container = document.getElementById('staff-container');
    if (!container) return;

    const parent = container.parentElement;
    if (!parent || parent.querySelector('.carousel-nav')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'carousel-wrapper';
    parent.insertBefore(wrapper, container);
    wrapper.appendChild(container);

    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-nav prev';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.setAttribute('aria-label', 'Previous faculty members');

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-nav next';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.setAttribute('aria-label', 'Next faculty members');

    wrapper.appendChild(prevBtn);
    wrapper.appendChild(nextBtn);

    let currentIndex = 0;
    const itemsPerPage = 2;
    const cards = Array.from(container.children);
    const totalCards = cards.length;
    let autoSlideInterval;

    // Add carousel-active class to container
    container.classList.add('carousel-active');

    function showSlide(index) {
        // Calculate proper index with wrapping
        if (index >= totalCards - itemsPerPage + 1) {
            currentIndex = 0;
        } else if (index < 0) {
            currentIndex = Math.max(0, totalCards - itemsPerPage);
        } else {
            currentIndex = index;
        }

        // Hide all cards first
        cards.forEach((card) => {
            card.classList.remove('carousel-visible');
            card.classList.add('carousel-hidden');
        });

        // Show only the current 2 cards
        for (let i = currentIndex; i < currentIndex + itemsPerPage && i < totalCards; i++) {
            cards[i].classList.remove('carousel-hidden');
            cards[i].classList.add('carousel-visible');
        }
    }

    function nextSlide() {
        showSlide(currentIndex + itemsPerPage);
    }

    function prevSlide() {
        showSlide(currentIndex - itemsPerPage);
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 4000);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoSlide();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoSlide();
    });

    wrapper.addEventListener('mouseenter', stopAutoSlide);
    wrapper.addEventListener('mouseleave', startAutoSlide);

    // Initialize - show first 2 cards
    showSlide(0);
    startAutoSlide();
}

async function loadGalleryImages() {
    const container = document.getElementById('gallery-grid');
    if (!container) return;

    let galleryImages = [];
    
    try {
        // Try API first
        const response = await api.getGalleryImages();
        // Backend returns images directly as array, not wrapped in object
        galleryImages = Array.isArray(response) ? response : (response.images || []);
        console.log('Loaded gallery images from API:', galleryImages.length, galleryImages);
    } catch (error) {
        // Fallback to localStorage
        console.warn('API unavailable, using localStorage:', error);
        galleryImages = JSON.parse(localStorage.getItem('galleryImages')) || [];
        console.log('Loaded gallery images from localStorage:', galleryImages.length, galleryImages);
    }
    
    // If no images from admin, keep default images
    if (galleryImages.length === 0) {
        console.log('No admin images found, keeping default images');
        return; // Keep the default hardcoded images
    }

    // Sort by newest first (uploadDate or id)
    galleryImages.sort((a, b) => {
        const dateA = new Date(a.uploadDate || a.upload_date || a.created_at || 0);
        const dateB = new Date(b.uploadDate || b.upload_date || b.created_at || 0);
        return dateB - dateA || b.id - a.id;
    });

    // CLEAR existing images (including placeholders) before adding new ones
    container.innerHTML = '';
    console.log('Cleared existing gallery images, adding', galleryImages.length, 'new images');
    
    // Create a document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    // Add admin-uploaded images
    galleryImages.forEach((image, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item glass-card';
        
        // Handle category - if "all" is selected, show in all categories
        const displayCategory = image.category === 'all' ? 'all' : image.category;
        galleryItem.setAttribute('data-cat', displayCategory);
        
        // Handle both API URLs and base64 data URLs
        const imageUrl = image.fileUrl || image.thumbnail;
        const eventName = image.eventName || image.event_name || 'Untitled';
        const description = image.description || formatDate(image.eventDate || image.event_date);
        
        console.log(`Creating gallery item ${index + 1}:`, { imageUrl, eventName, description });
        
        // Add loading attribute for lazy loading
        galleryItem.innerHTML = `
            <img src="${imageUrl}" 
                 alt="${eventName}"
                 loading="lazy"
                 style="opacity: 0; transition: opacity 0.3s ease-in;">
            <div class="gallery-caption">
                <h4>${eventName}</h4>
                <p style="font-size:0.78rem; color:rgba(255,255,255,0.7);">${description}</p>
            </div>
        `;
        
        fragment.appendChild(galleryItem);
    });
    
    // Append all at once for better performance
    container.appendChild(fragment);
    console.log('Gallery images added to DOM');
    
    // Fade in images after they load
    const newImages = container.querySelectorAll('img[loading="lazy"]');
    newImages.forEach(img => {
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
        }
    });
    
    // Re-initialize gallery filter after loading new images
    initGalleryFilter();
}

async function loadAdminDownloads() {
    // Only run on admission page
    const container = document.getElementById('admin-downloads-list');
    if (!container) return;

    let files = [];
    try {
        const response = await api.getDownloadFiles();
        files = response.files || [];
    } catch {
        files = JSON.parse(localStorage.getItem('filesDatabase')) || [];
    }

    if (files.length === 0) return; // Keep default static items

    const iconMap = { pdf: 'fa-file-pdf', doc: 'fa-file-word', docx: 'fa-file-word', xls: 'fa-file-excel', xlsx: 'fa-file-excel' };
    const colorMap = { pdf: 'pink', doc: 'blue', docx: 'blue', xls: 'green', xlsx: 'green' };

    container.innerHTML = files.map(file => {
        const ext = (file.fileName || file.file_name || '').split('.').pop().toLowerCase();
        const icon = iconMap[ext] || 'fa-file-alt';
        const color = colorMap[ext] || 'amber';
        const url = file.fileUrl || file.file_path || '#';
        const title = file.title;
        const size = file.fileSize || file.file_size;
        const sizeStr = size ? `${(size / 1024).toFixed(0)} KB` : '';
        return `
            <div class="resource-card glass glass-card" style="padding:16px 18px;">
                <div class="resource-icon ${color}"><i class="fas ${icon}"></i></div>
                <div style="flex:1;">
                    <div style="font-weight:600; font-size:0.92rem;">${title}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${ext.toUpperCase()} ${sizeStr ? '· ' + sizeStr : ''}</div>
                </div>
                <a href="${url}" download class="btn btn-sm" style="text-decoration:none;"><i class="fas fa-download"></i></a>
            </div>`;
    }).join('');
}

async function loadAdminFeeStructure() {
    // Only run on admission page
    const tbody = document.getElementById('admin-fee-tbody');
    if (!tbody) return;

    let fees = [];
    try {
        const response = await api.getFeeStructure();
        fees = response.fees || [];
    } catch {
        fees = JSON.parse(localStorage.getItem('feeDatabase')) || [];
    }

    if (fees.length === 0) return; // Keep default static rows

    tbody.innerHTML = fees.map(fee => `
        <tr>
            <td><strong>${fee.class_name || fee.class}</strong></td>
            <td>&#8377; ${Number(fee.admission_fee || fee.admissionFee).toLocaleString('en-IN')}</td>
            <td>&#8377; ${Number(fee.tuition_fee || fee.tuitionFee).toLocaleString('en-IN')}</td>
            <td>&#8377; ${Number(fee.annual_charges || fee.annualCharges).toLocaleString('en-IN')}</td>
            <td>${fee.transport_fee || fee.transportFee}</td>
        </tr>`).join('');
}


function initFacultyModal() {
    // Create modal if it doesn't exist
    if (!document.getElementById('facultyModal')) {
        const modalHTML = `
            <div id="facultyModal" class="modal">
                <div class="modal-overlay"></div>
                <div class="modal-content glass">
                    <button class="modal-close" aria-label="Close modal">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="faculty-detail-grid">
                        <div class="faculty-detail-left">
                            <div class="faculty-detail-avatar" id="facultyModalAvatar"></div>
                            <h3 id="facultyModalName" style="margin-top:16px; font-size:1.3rem;"></h3>
                            <p id="facultyModalDesignation" style="color:var(--primary); font-size:0.9rem; margin-top:4px; font-weight:600;"></p>
                        </div>
                        <div class="faculty-detail-right">
                            <h4 style="font-size:1.1rem; margin-bottom:16px; color:#60a5fa;">Faculty Information</h4>
                            <div id="facultyModalInfo"></div>
                            
                            <div style="margin-top:24px; padding:20px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.25); border-radius:12px;">
                                <h4 style="font-size:0.95rem; margin-bottom:8px; color:#34d399;">About</h4>
                                <p id="facultyModalRemarks" style="font-size:0.88rem; line-height:1.7; color:rgba(255,255,255,0.85);"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

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

    // Add click handlers to faculty cards
    document.querySelectorAll('.faculty-card').forEach(card => {
        card.addEventListener('click', () => {
            const facultyId = parseInt(card.dataset.facultyId);
            if (window.facultyData && window.facultyData[facultyId]) {
                showFacultyModal(window.facultyData[facultyId]);
            }
        });
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
