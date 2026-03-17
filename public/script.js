/**
 * Eid Salami Web App
 * Complete Client-side JavaScript
 * Developer: Md. Fojle Rabby
 */

// ==================== API Configuration ====================
const API_URL = '/.netlify/functions/api';

// ==================== Utility Functions ====================

// Show loading spinner
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

// Hide loading spinner
function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.style.display = 'none';
}

// Show toast message
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

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ কপি হয়েছে!', 'success');
    }).catch(() => {
        showToast('❌ কপি করা যায়নি', 'error');
    });
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('bn-BD', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ==================== API Functions ====================

// Create new salami link
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
        console.log('Create link response:', data);

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

// Get user info by username
async function getUserInfo(username) {
    try {
        console.log('Fetching user:', username);
        const response = await fetch(`${API_URL}/user/${username}`);
        const data = await response.json();
        console.log('User data response:', data);
        
        if (data.success && data.user) {
            return data.user;
        } else {
            console.log('No user data found');
            return null;
        }
    } catch (error) {
        console.error('Get user error:', error);
        return null;
    }
}

// Send salami (create transaction)
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

// Get dashboard data
async function getDashboardData(username) {
    try {
        const response = await fetch(`${API_URL}/dashboard/${username}`);
        const data = await response.json();
        
        if (data.success && data.user) {
            return data.user;
        } else {
            showToast('ইউজার পাওয়া যায়নি', 'error');
            return null;
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        showToast('❌ নেটওয়ার্ক সমস্যা হয়েছে', 'error');
        return null;
    }
}

// ==================== Make functions globally available ====================
window.createSalamiLink = createSalamiLink;
window.sendSalami = sendSalami;
window.getDashboardData = getDashboardData;
window.getUserInfo = getUserInfo;
window.copyToClipboard = copyToClipboard;
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.formatDate = formatDate;

// ==================== Add CSS Animations ====================

const style = document.createElement('style');
style.textContent = `
    .loading-spinner {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(5px);
    }
    
    .spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #764ba2;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .loading-spinner p {
        color: white;
        margin-top: 10px;
        font-size: 18px;
    }
    
    @keyframes slideInUp {
        from { transform: translateX(-50%) translateY(100%); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }

    .hidden {
        display: none !important;
    }
`;

document.head.appendChild(style);