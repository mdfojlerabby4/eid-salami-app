// API ফাংশন - সম্পূর্ণ কোড
exports.handler = async (event) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // OPTIONS request (for CORS preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    const path = event.path.replace('/.netlify/functions/api', '');
    
    // Create link endpoint
    if (path === '/create-link' && event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body || '{}');
            
            // Generate username
            const username = (body.name || 'user').replace(/\s+/g, '') + 
                            Math.floor(Math.random() * 1000);
            
            // পুরো URL তৈরি করুন
            const fullLink = `https://rabby-eid-salami.netlify.app/salami-link.html?user=${username}`;
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    link: fullLink,  // এখন পুরো URL দেখাবে
                    username: username
                })
            };
        } catch (error) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: error.message
                })
            };
        }
    }

    // Default response
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            message: 'API is working'
        })
    };
};