/* =========================================
   RESULTS ADMIN FUNCTIONALITY
========================================= */

let resultsDatabase = JSON.parse(localStorage.getItem('resultsDatabase')) || [];
let selectedFile = null;

document.addEventListener('DOMContentLoaded', () => {
    initResultsFileUpload();
    initResultsForm();
    loadUploadedResults();
    updateStatistics();
    initTemplateDownload();
});

function initResultsFileUpload() {
    const uploadArea = document.getElementById('resultsFileUploadArea');
    const fileInput = document.getElementById('resultsFile');
    const fileNameDisplay = document.getElementById('selectedFileName');

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            fileNameDisplay.textContent = `Selected: ${file.name}`;
            fileNameDisplay.style.display = 'block';
        }
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--accent)';
        uploadArea.style.background = 'rgba(16,185,129,0.1)';
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
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
            selectedFile = file;
            fileInput.files = e.dataTransfer.files;
            fileNameDisplay.textContent = `Selected: ${file.name}`;
            fileNameDisplay.style.display = 'block';
        }
    });
}

function initResultsForm() {
    const form = document.getElementById('resultsUploadForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!selectedFile) {
            showMessage('resultsUploadMsg', 'error', 'Please select a file to upload.');
            return;
        }

        const formData = {
            session: document.getElementById('academicSession').value,
            class: document.getElementById('resultClass').value,
            examType: document.getElementById('examType').value,
            uploadDate: new Date().toISOString(),
            fileName: selectedFile.name
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        try {
            const studentsData = await parseExcelFile(selectedFile);
            
            const resultEntry = {
                id: Date.now(),
                ...formData,
                studentsCount: studentsData.length,
                students: studentsData
            };

            resultsDatabase.push(resultEntry);
            localStorage.setItem('resultsDatabase', JSON.stringify(resultsDatabase));

            showMessage('resultsUploadMsg', 'success', `Successfully uploaded results for ${studentsData.length} students.`);
            
            form.reset();
            selectedFile = null;
            document.getElementById('selectedFileName').style.display = 'none';
            
            loadUploadedResults();
            updateStatistics();

        } catch (error) {
            showMessage('resultsUploadMsg', 'error', `Error processing file: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Results';
        }
    });
}

function parseExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                if (jsonData.length === 0) {
                    reject(new Error('File is empty or invalid format'));
                    return;
                }

                // Process and validate data
                const students = jsonData.map((row, index) => {
                    const rollNumber = row['Roll Number'] || row['RollNo'] || row['Roll No'];
                    const studentName = row['Student Name'] || row['Name'];
                    const dob = row['DOB'] || row['Date of Birth'];

                    if (!rollNumber || !studentName) {
                        throw new Error(`Missing required fields in row ${index + 2}`);
                    }

                    // Extract subject marks
                    const subjects = [];
                    Object.keys(row).forEach(key => {
                        if (!['Roll Number', 'RollNo', 'Roll No', 'Student Name', 'Name', 'DOB', 'Date of Birth', 'Class', 'Section'].includes(key)) {
                            const marks = parseInt(row[key]);
                            if (!isNaN(marks)) {
                                subjects.push({
                                    name: key,
                                    marks: marks,
                                    maxMarks: 100
                                });
                            }
                        }
                    });

                    const totalMarks = subjects.reduce((sum, s) => sum + s.marks, 0);
                    const maxMarks = subjects.reduce((sum, s) => sum + s.maxMarks, 0);
                    const percentage = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(2) : 0;

                    return {
                        rollNumber: String(rollNumber),
                        studentName,
                        dob: dob || '',
                        subjects,
                        totalMarks,
                        maxMarks,
                        percentage,
                        status: percentage >= 33 ? 'PASS' : 'FAIL'
                    };
                });

                resolve(students);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
}

function loadUploadedResults() {
    const container = document.getElementById('uploadedResultsList');
    
    if (resultsDatabase.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:var(--text-muted);">
                <i class="fas fa-inbox" style="font-size:2.5rem; margin-bottom:12px; opacity:0.3;"></i>
                <p style="font-size:0.9rem;">No results uploaded yet</p>
            </div>
        `;
        return;
    }

    const sortedResults = [...resultsDatabase].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    container.innerHTML = sortedResults.slice(0, 5).map(result => `
        <div class="result-upload-item glass" style="padding:16px; margin-bottom:12px; border-radius:12px; border:1px solid var(--glass-border);">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                <div>
                    <h4 style="font-size:0.9rem; margin-bottom:4px;">Class ${result.class} - ${result.examType}</h4>
                    <p style="font-size:0.75rem; color:var(--text-muted);">${result.session} • ${result.studentsCount} students</p>
                </div>
                <button class="btn-icon-delete" data-id="${result.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div style="font-size:0.72rem; color:var(--text-muted);">
                <i class="fas fa-clock"></i> ${formatDateTime(result.uploadDate)}
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.btn-icon-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            deleteResult(id);
        });
    });
}

function deleteResult(id) {
    if (!confirm('Are you sure you want to delete this result entry?')) return;

    resultsDatabase = resultsDatabase.filter(r => r.id !== id);
    localStorage.setItem('resultsDatabase', JSON.stringify(resultsDatabase));
    loadUploadedResults();
    updateStatistics();
}

function updateStatistics() {
    const totalStudents = resultsDatabase.reduce((sum, r) => sum + r.studentsCount, 0);
    const totalResults = resultsDatabase.length;
    const lastUpdated = resultsDatabase.length > 0 
        ? formatDateTime(resultsDatabase[resultsDatabase.length - 1].uploadDate)
        : 'Never';

    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('totalResults').textContent = totalResults;
    document.getElementById('lastUpdated').textContent = lastUpdated;
}

function initTemplateDownload() {
    document.getElementById('downloadTemplate').addEventListener('click', (e) => {
        e.preventDefault();
        
        const templateData = [
            {
                'Roll Number': '001',
                'Student Name': 'John Doe',
                'DOB': '15/01/2010',
                'Mathematics': 95,
                'Science': 88,
                'English': 92,
                'Hindi': 85,
                'Social Science': 90
            },
            {
                'Roll Number': '002',
                'Student Name': 'Jane Smith',
                'DOB': '20/03/2010',
                'Mathematics': 92,
                'Science': 94,
                'English': 89,
                'Hindi': 87,
                'Social Science': 93
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Results');
        XLSX.writeFile(wb, 'results_template.xlsx');
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
