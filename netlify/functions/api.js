// সম্পূর্ণ API ফাংশন
exports.handler = async (event) => {
    console.log('Function called:', event.path);
    
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const path = event.path.replace('/.netlify/functions/api', '');
    
    // 📌 1. Create link - ইউজার তৈরি করুন (নাম ও নোট সহ)
    if (path === '/create-link' && event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body);
            const username = (body.name || 'user').replace(/\s+/g, '') + 
                            Math.floor(Math.random() * 1000);
            
            // ইউজার ডাটা স্টোর করুন (নাম ও নোট সহ)
            global.users = global.users || {};
            global.users[username] = {
                username: username,
                name: body.name || 'Salami Receiver',  // নাম সংরক্ষণ
                bkashNumber: body.bkashNumber,
                nagadNumber: body.nagadNumber || '',
                note: body.note || 'ঈদ মোবারক!',       // নোট সংরক্ষণ
                totalReceived: 0,
                totalTransactions: 0,
                transactions: [],                       // খালি অ্যারে
                createdAt: new Date().toISOString()
            };
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    link: `https://rabby-eid-salami.netlify.app/salami-link.html?user=${username}`,
                    username: username,
                    name: body.name || 'Salami Receiver',  // নাম পাঠান
                    note: body.note || 'ঈদ মোবারক!'       // নোট পাঠান
                })
            };
        } catch (error) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: error.message })
            };
        }
    }
    
    // 📌 2. Get user info - ইউজারের তথ্য দেখান (নাম ও নোট সহ)
    if (path.startsWith('/user/') && event.httpMethod === 'GET') {
        const username = path.replace('/user/', '');
        
        const users = global.users || {};
        const user = users[username];
        
        if (!user) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ success: false, error: 'User not found' })
            };
        }
        
        // সম্পূর্ণ তথ্য পাঠান (নাম ও নোট সহ)
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                user: {
                    name: user.name,                // নাম পাঠান
                    bkashNumber: user.bkashNumber,
                    nagadNumber: user.nagadNumber,
                    note: user.note                  // নোট পাঠান
                }
            })
        };
    }
    
    // 📌 3. Send salami - টাকা পাঠানোর রেকর্ড রাখুন
    if (path === '/send-salami' && event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body);
            const { receiverUsername, senderName, senderPhone, amount, note } = body;
            
            const users = global.users || {};
            const user = users[receiverUsername];
            
            if (!user) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ success: false, error: 'Receiver not found' })
                };
            }
            
            // ট্রানজ্যাকশন তৈরি করুন
            const transaction = {
                id: 'TXN' + Date.now(),
                senderName: senderName || 'বেনামী',
                senderPhone: senderPhone || '',
                amount: parseInt(amount),
                note: note || '',
                createdAt: new Date().toISOString()
            };
            
            user.transactions = user.transactions || [];
            user.transactions.push(transaction);
            user.totalReceived = (user.totalReceived || 0) + parseInt(amount);
            user.totalTransactions = (user.totalTransactions || 0) + 1;
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'সালামি পাঠানোর জন্য ধন্যবাদ!',
                    transactionId: transaction.id
                })
            };
        } catch (error) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, error: error.message })
            };
        }
    }
    
    // 📌 4. Dashboard - ড্যাশবোর্ডের জন্য ট্রানজ্যাকশন সহ ইউজারের তথ্য দিন
    if (path.startsWith('/dashboard/') && event.httpMethod === 'GET') {
        const username = path.replace('/dashboard/', '');
        
        const users = global.users || {};
        const user = users[username];
        
        if (!user) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ success: false, error: 'User not found' })
            };
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                user: {
                    name: user.name,
                    username: user.username,
                    bkashNumber: user.bkashNumber,
                    nagadNumber: user.nagadNumber,
                    note: user.note,
                    totalReceived: user.totalReceived || 0,
                    totalTransactions: user.totalTransactions || 0,
                    transactions: user.transactions || []  // বাস্তব ট্রানজ্যাকশন
                }
            })
        };
    }
    
    return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ success: false, error: 'Not found' })
    };
};