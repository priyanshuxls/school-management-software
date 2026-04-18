/* =========================================
   ABOUT SECTION ADMIN FUNCTIONALITY
========================================= */

let aboutData = JSON.parse(localStorage.getItem('aboutData')) || {
    schoolInfo: {
        name: 'Amol Chand Public School',
        establishedYear: 1985,
        affiliation: 'CBSE Affiliated',
        description: 'Amol Chand Public School, established in 1985, is a CBSE affiliated institution committed to nurturing minds and building character.'
    },
    missionVision: {
        mission: 'To provide a stimulating learning environment that maximizes individual potential and equips students to meet the challenges of education, work, and life.',
        vision: 'To be a center of excellence in education, shaping compassionate and responsible global citizens with strong 21st-century skills.'
    },
    principal: {
        name: 'Dr. A. K. Singh',
        designation: 'Principal',
        message: 'At ACPS, we focus on instilling a lifelong love for learning, a spirit of curiosity, and the resilience to face life\'s challenges. Our dedicated faculty works tirelessly to ensure each child reaches their highest potential.'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadExistingData();
    initSchoolInfoForm();
    initMissionVisionForm();
    initPrincipalForm();
});

function loadExistingData() {
    // Load School Info
    document.getElementById('schoolName').value = aboutData.schoolInfo.name;
    document.getElementById('establishedYear').value = aboutData.schoolInfo.establishedYear;
    document.getElementById('affiliation').value = aboutData.schoolInfo.affiliation;
    document.getElementById('schoolDescription').value = aboutData.schoolInfo.description;

    // Load Mission & Vision
    document.getElementById('mission').value = aboutData.missionVision.mission;
    document.getElementById('vision').value = aboutData.missionVision.vision;

    // Load Principal Info
    document.getElementById('principalName').value = aboutData.principal.name;
    document.getElementById('principalDesignation').value = aboutData.principal.designation;
    document.getElementById('principalMessage').value = aboutData.principal.message;
}

function initSchoolInfoForm() {
    const form = document.getElementById('schoolInfoForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        aboutData.schoolInfo = {
            name: document.getElementById('schoolName').value.trim(),
            establishedYear: parseInt(document.getElementById('establishedYear').value),
            affiliation: document.getElementById('affiliation').value.trim(),
            description: document.getElementById('schoolDescription').value.trim()
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        setTimeout(() => {
            localStorage.setItem('aboutData', JSON.stringify(aboutData));
            showMessage('schoolInfoMsg', 'success', 'School information updated successfully!');

            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save School Info';
        }, 800);
    });
}

function initMissionVisionForm() {
    const form = document.getElementById('missionVisionForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        aboutData.missionVision = {
            mission: document.getElementById('mission').value.trim(),
            vision: document.getElementById('vision').value.trim()
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        setTimeout(() => {
            localStorage.setItem('aboutData', JSON.stringify(aboutData));
            showMessage('missionVisionMsg', 'success', 'Mission & Vision updated successfully!');

            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Mission & Vision';
        }, 800);
    });
}

function initPrincipalForm() {
    const form = document.getElementById('principalForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        aboutData.principal = {
            name: document.getElementById('principalName').value.trim(),
            designation: document.getElementById('principalDesignation').value.trim(),
            message: document.getElementById('principalMessage').value.trim()
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        setTimeout(() => {
            localStorage.setItem('aboutData', JSON.stringify(aboutData));
            showMessage('principalMsg', 'success', 'Principal\'s message updated successfully!');

            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Principal\'s Message';
        }, 800);
    });
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
