/* =========================================
   FEE STRUCTURE ADMIN FUNCTIONALITY
========================================= */

let feeDatabase = JSON.parse(localStorage.getItem('feeDatabase')) || [];

document.addEventListener('DOMContentLoaded', () => {
    initFeeForm();
    loadFeeStructure();
});

function initFeeForm() {
    const form = document.getElementById('feeForm');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const feeData = {
            id: Date.now(),
            class: document.getElementById('feeClass').value.trim(),
            session: document.getElementById('feeSession').value.trim(),
            admissionFee: parseInt(document.getElementById('admissionFee').value),
            tuitionFee: parseInt(document.getElementById('tuitionFee').value),
            annualCharges: parseInt(document.getElementById('annualCharges').value),
            transportFee: document.getElementById('transportFee').value.trim(),
            createdAt: new Date().toISOString()
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        setTimeout(() => {
            feeDatabase.push(feeData);
            localStorage.setItem('feeDatabase', JSON.stringify(feeDatabase));

            showMessage('feeMsg', 'success', 'Fee structure saved successfully!');
            
            form.reset();
            loadFeeStructure();

            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Fee Structure';
        }, 800);
    });
}

function loadFeeStructure() {
    const tbody = document.getElementById('feeTableBody');
    
    if (feeDatabase.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:40px 20px; color:var(--text-muted);">
                    <i class="fas fa-inbox" style="font-size:2rem; margin-bottom:12px; opacity:0.3; display:block;"></i>
                    No fee structure added yet
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = feeDatabase.map(fee => `
        <tr>
            <td><strong>${fee.class}</strong><br><small style="color:var(--text-muted);">${fee.session}</small></td>
            <td>&#8377; ${fee.admissionFee.toLocaleString()}</td>
            <td>&#8377; ${fee.tuitionFee.toLocaleString()}</td>
            <td>&#8377; ${fee.annualCharges.toLocaleString()}</td>
            <td>${fee.transportFee}</td>
            <td>
                <button class="btn-icon-delete" data-id="${fee.id}" title="Delete" style="margin:0;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.btn-icon-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            deleteFee(id);
        });
    });
}

function deleteFee(id) {
    if (!confirm('Are you sure you want to delete this fee entry?')) return;

    feeDatabase = feeDatabase.filter(f => f.id !== id);
    localStorage.setItem('feeDatabase', JSON.stringify(feeDatabase));
    loadFeeStructure();
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
