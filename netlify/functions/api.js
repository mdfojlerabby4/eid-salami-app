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
    
    // 1. Create link
    if (path === '/create-link' && event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body);
            const username = (body.name || 'user').replace(/\s+/g, '') + 
                            Math.floor(Math.random() * 1000);
            
            // Save user data (in memory - for demo)
            // In production, use a database
            global.users = global.users || {};
            global.users[username] = {
                name: body.name || 'Salami Receiver',
                bkashNumber: body.bkashNumber,
                nagadNumber: body.nagadNumber,
                note: body.note || 'ঈদ মোবারক!'
            };
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    link: `https://rabby-eid-salami.netlify.app/salami-link.html?user=${username}`,
                    username: username
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
    
    // 2. Get user info
    if (path.startsWith('/user/') && event.httpMethod === 'GET') {
        const username = path.replace('/user/', '');
        
        // Get user from memory
        const users = global.users || {};
        const user = users[username];
        
        if (!user) {
            // Demo data if not found
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    user: {
                        name: 'Test User',
                        bkashNumber: '01303995260',
                        nagadNumber: '01303995260',
                        note: 'ঈদ মোবারক!'
                    }
                })
            };
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                user: user
            })
        };
    }
    
    // 3. Send salami
    if (path === '/send-salami' && event.httpMethod === 'POST') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Salami sent successfully',
                transactionId: 'TXN' + Date.now()
            })
        };
    }
    
    // 4. Dashboard
    if (path.startsWith('/dashboard/') && event.httpMethod === 'GET') {
        const username = path.replace('/dashboard/', '');
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                user: {
                    name: 'Test User',
                    username: username,
                    bkashNumber: '01303995260',
                    nagadNumber: '01303995260',
                    totalReceived: 500,
                    totalTransactions: 2,
                    transactions: [
                        {
                            id: 1,
                            senderName: 'Rahim',
                            amount: 200,
                            createdAt: new Date().toISOString()
                        },
                        {
                            id: 2,
                            senderName: 'Karim',
                            amount: 300,
                            createdAt: new Date().toISOString()
                        }
                    ]
                }
            })
        };
    }
    
    // Default response
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
            success: true, 
            message: 'API is working',
            path: path
        })
    };
};