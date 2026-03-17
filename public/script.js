/**
 * Eid Salami Web App
 * Netlify Version - Complete Client-side JavaScript
 */

// API URL for Netlify Functions
//const API_URL = '/.netlify/functions/api';
const API_URL = '/.netlify/functions/api';
// ==================== Utility Functions ====================

function showLoading() {
    let spinner = document.getElementById('loading-spinner');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.className = 'loading-spinner';
        spinner.innerHTML = '<div class="spinner"></div><p>লোড হচ্ছে...</p>';
        document.body.appendChild(spinner);
    }
    spinner.style.display = 'flex';
}

function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';
}

function showToast(message, type = 'success', duration = 3000) {
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#ffc107'};
        color: white;
        padding: 12px 24px;
        border-radius: 30px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideInUp 0.3s ease;
        font-size: 16px;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, duration);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ কপি হয়েছে!', 'success');
    }).catch(() => {
        showToast('❌ কপি করা যায়নি', 'error');
    });
}

// ==================== API Functions ====================

async function createSalamiLink(formData) {
    try {
        showLoading();

        // Validation - বিকাশ বা নগদ যেকোনো একটা থাকতে হবে
        if (!formData.bkashNumber && !formData.nagadNumber) {
            showToast('বিকাশ অথবা নগদ নাম্বার দেওয়া বাধ্যতামূলক', 'error');
            return null;
        }

        const response = await fetch(`${API_URL}/create-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showToast('✅ লিংক তৈরি হয়েছে!', 'success');
            return data;
        } else {
            showToast(data.error || '❌ লিংক তৈরি করা যায়নি', 'error');
            return null;
        }
    } catch (error) {
        console.error('Create link error:', error);
        showToast('❌ নেটওয়ার্ক সমস্যা হয়েছে', 'error');
        return null;
    } finally {
        hideLoading();
    }
}

async function getUserInfo(username) {
    try {
        const response = await fetch(`${API_URL}/user/${username}`);
        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

async function sendSalami(transactionData) {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/send-salami`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Send salami error:', error);
        showToast('❌ নেটওয়ার্ক সমস্যা হয়েছে', 'error');
        return null;
    } finally {
        hideLoading();
    }
}

async function getDashboardData(username) {
    try {
        const response = await fetch(`${API_URL}/dashboard/${username}`);
        const data = await response.json();
        return data.user;
    } catch (error) {
        console.error('Dashboard error:', error);
        showToast('❌ নেটওয়ার্ক সমস্যা হয়েছে', 'error');
        return null;
    }
}

// ==================== Home Page Functions ====================

document.addEventListener('DOMContentLoaded', function() {
    const createLinkForm = document.getElementById('createLinkForm');
    if (createLinkForm) {
        createLinkForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                name: document.getElementById('name')?.value || '',
                bkashNumber: document.getElementById('bkashNumber')?.value,
                nagadNumber: document.getElementById('nagadNumber')?.value || '',
                note: document.getElementById('note')?.value || 'ঈদ মোবারক!'
            };

            const result = await createSalamiLink(formData);

            if (result?.success) {
                const resultDiv = document.getElementById('result');
                const linkDisplay = document.getElementById('generatedLink');
                
                if (resultDiv && linkDisplay) {
                    linkDisplay.textContent = result.link;
                    resultDiv.style.display = 'block';
                    localStorage.setItem('myUsername', result.username);
                }
                createLinkForm.reset();
            }
        });
    }
});

// Global functions
window.copyLink = function() {
    const link = document.getElementById('generatedLink')?.textContent;
    if (link) copyToClipboard(link);
};

window.goToDashboard = function() {
    const username = localStorage.getItem('myUsername');
    window.location.href = username ? `/dashboard.html?user=${username}` : '/dashboard.html';
};

// Make functions globally available
window.createSalamiLink = createSalamiLink;
window.sendSalami = sendSalami;
window.getDashboardData = getDashboardData;
window.getUserInfo = getUserInfo;
window.copyToClipboard = copyToClipboard;
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;