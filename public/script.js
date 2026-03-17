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
        return data.user;
    } catch (error) {
        console.error('Dashboard error:', error);
        showToast('❌ নেটওয়ার্ক সমস্যা হয়েছে', 'error');
        return null;
    }
}

// ==================== Home Page Functions ====================

function initHomePage() {
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
}

// Global functions for home page
window.copyLink = function() {
    const link = document.getElementById('generatedLink')?.textContent;
    if (link) copyToClipboard(link);
};

window.goToDashboard = function() {
    const username = localStorage.getItem('myUsername');
    window.location.href = username ? `/dashboard.html?user=${username}` : '/dashboard.html';
};

// ==================== Salami Link Page Functions ====================

function initSalamiLinkPage() {
    // Get username from URL
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    
    console.log('Salami page for user:', username);
    
    if (!username) {
        showToast('ইউজার নাম পাওয়া যায়নি', 'error');
        return;
    }

    // Load user info
    loadUserInfo(username);

    // Amount selection
    const amountButtons = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('customAmount');
    let selectedAmount = null;

    if (amountButtons.length) {
        amountButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                amountButtons.forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                selectedAmount = parseInt(this.dataset.amount);
                if (customAmountInput) customAmountInput.value = '';
            });
        });
    }

    if (customAmountInput) {
        customAmountInput.addEventListener('input', function() {
            amountButtons.forEach(b => b.classList.remove('selected'));
            selectedAmount = null;
        });
    }

    // Send salami button
    const sendBtn = document.getElementById('sendSalamiBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', async function() {
            let amount = selectedAmount;
            const customAmount = document.getElementById('customAmount')?.value;
            if (customAmount) amount = parseInt(customAmount);

            if (!amount || amount < 1) {
                showToast('সালামির পরিমাণ নির্বাচন করুন', 'error');
                return;
            }

            const transactionData = {
                receiverUsername: username,
                senderName: document.getElementById('senderName')?.value || 'বেনামী',
                senderPhone: document.getElementById('senderPhone')?.value || '',
                amount: amount,
                note: document.getElementById('senderNote')?.value || '',
                paymentMethod: 'bkash'
            };

            const result = await sendSalami(transactionData);
            if (result?.success) {
                showToast('✅ সালামি পাঠানোর জন্য ধন্যবাদ!', 'success');
                setTimeout(() => window.location.href = '/', 2000);
            }
        });
    }
}

async function loadUserInfo(username) {
    showLoading();
    try {
        const user = await getUserInfo(username);
        console.log('Loaded user:', user);
        
        if (user) {
            // Update receiver note
            const receiverNote = document.getElementById('receiverNote');
            if (receiverNote) {
                receiverNote.textContent = user.note || 'ঈদ মোবারক!';
            }

            // Update bkash section
            const bkashNumber = document.getElementById('bkashNumber');
            const bkashSection = document.getElementById('bkashSection');
            
            if (user.bkashNumber) {
                if (bkashNumber) bkashNumber.textContent = user.bkashNumber;
                if (bkashSection) bkashSection.style.display = 'block';
            } else {
                if (bkashSection) bkashSection.style.display = 'none';
            }

            // Update nagad section
            const nagadNumber = document.getElementById('nagadNumber');
            const nagadSection = document.getElementById('nagadSection');
            
            if (user.nagadNumber) {
                if (nagadNumber) nagadNumber.textContent = user.nagadNumber;
                if (nagadSection) nagadSection.style.display = 'block';
            } else {
                if (nagadSection) nagadSection.style.display = 'none';
            }

            // Show warning if no payment methods
            if (!user.bkashNumber && !user.nagadNumber) {
                showToast('এই ইউজারের কোন পেমেন্ট নাম্বার নেই!', 'error');
            }
        } else {
            // Show demo data
            const receiverNote = document.getElementById('receiverNote');
            if (receiverNote) receiverNote.textContent = 'ঈদ মোবারক! ডেমো ইউজার';
            
            const bkashNumber = document.getElementById('bkashNumber');
            if (bkashNumber) bkashNumber.textContent = '01303995260';
            
            const nagadNumber = document.getElementById('nagadNumber');
            if (nagadNumber) nagadNumber.textContent = '01303995260';
        }
    } catch (error) {
        console.error('Error loading user:', error);
        showToast('ইউজার তথ্য লোড করতে সমস্যা হয়েছে', 'error');
    } finally {
        hideLoading();
    }
}

// Make functions globally available for buttons
window.copyBkash = function() {
    const bkash = document.getElementById('bkashNumber')?.textContent;
    if (bkash && bkash !== '-') copyToClipboard(bkash);
};

window.copyNagad = function() {
    const nagad = document.getElementById('nagadNumber')?.textContent;
    if (nagad && nagad !== '-') copyToClipboard(nagad);
};

// ==================== Dashboard Page Functions ====================

function initDashboardPage() {
    const urlParams = new URLSearchParams(window.location.search);
    let username = urlParams.get('user') || localStorage.getItem('myUsername');

    if (!username) {
        showToast('ইউজার নাম পাওয়া যায়নি', 'error');
        setTimeout(() => window.location.href = '/', 2000);
        return;
    }

    loadDashboardData(username);

    // Refresh button
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => loadDashboardData(username));
    }
}

async function loadDashboardData(username) {
    showLoading();
    try {
        const userData = await getDashboardData(username);
        if (userData) updateDashboardUI(userData);
    } finally {
        hideLoading();
    }
}

function updateDashboardUI(user) {
    // Update stats
    document.getElementById('totalReceived').textContent = `৳ ${user.totalReceived || 0}`;
    document.getElementById('totalTransactions').textContent = user.totalTransactions || 0;
    
    const avg = user.totalTransactions > 0 ? Math.round(user.totalReceived / user.totalTransactions) : 0;
    document.getElementById('averageAmount').textContent = `৳ ${avg}`;
    
    if (user.transactions?.length > 0) {
        const max = Math.max(...user.transactions.map(t => t.amount));
        document.getElementById('maxAmount').textContent = `৳ ${max}`;
    }
    
    // Update user info
    document.getElementById('userUsername').textContent = user.username;
    document.getElementById('salamiLink').value = `https://rabby-eid-salami.netlify.app/salami-link.html?user=${user.username}`;
    
    // Update payment numbers
    document.getElementById('bkashNumber').textContent = user.bkashNumber || 'দেওয়া হয়নি';
    document.getElementById('nagadNumber').textContent = user.nagadNumber || 'দেওয়া হয়নি';
    
    // Update transactions table
    if (user.transactions?.length > 0) {
        let html = '';
        user.transactions.forEach(tx => {
            html += `
                <tr>
                    <td>${formatDate(tx.createdAt)}</td>
                    <td>${tx.senderName || 'বেনামী'}</td>
                    <td>${tx.senderPhone || '-'}</td>
                    <td class="amount-positive">৳ ${tx.amount}</td>
                    <td>${tx.note || '-'}</td>
                </tr>
            `;
        });
        document.getElementById('transactionsTableBody').innerHTML = html;
    }
}

// Make dashboard functions global
window.copyDashboardLink = function() {
    const link = document.getElementById('salamiLink').value;
    copyToClipboard(link);
};

window.loadDashboard = function() {
    const username = new URLSearchParams(window.location.search).get('user');
    if (username) loadDashboardData(username);
};

// ==================== Initialize on Page Load ====================

document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;

    if (path === '/' || path === '/index.html') {
        initHomePage();
    } else if (path.includes('salami-link.html')) {
        initSalamiLinkPage();
    } else if (path === '/dashboard.html' || path.includes('dashboard')) {
        initDashboardPage();
    }
});

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
`;

document.head.appendChild(style);