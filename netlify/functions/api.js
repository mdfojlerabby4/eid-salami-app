exports.handler = async (event) => {
    // Log everything for debugging
    console.log('Method:', event.httpMethod);
    console.log('Path:', event.path);
    console.log('Body:', event.body);

    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS request (for CORS)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Handle POST request to create-link
    if (event.path.includes('/create-link') && event.httpMethod === 'POST') {
        try {
            // Parse the request body
            const body = JSON.parse(event.body || '{}');
            
            // Generate username
            const username = (body.name || 'user').replace(/\s+/g, '') + 
                            Math.floor(Math.random() * 1000);
            
            // Success response
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    link: `/salami-link.html?user=${username}`,
                    username: username
                })
            };
        } catch (error) {
            // Error response
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

    // Handle GET request to health check
    if (event.path.includes('/health')) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'API is healthy'
            })
        };
    }

    // Default response for other routes
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            message: 'API is working',
            path: event.path,
            method: event.httpMethod
        })
    };
};