import fetch from 'node-fetch';

async function testSignup() {
    try {
        const res = await fetch('http://127.0.0.1:8083/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test',
                email: 'test' + Date.now() + '@example.com',
                password: 'password123',
                role: 'user'
            }),
        });
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response text:', text);
        try {
            const json = JSON.parse(text);
            console.log('Response JSON:', json);
        } catch (e) {
            console.log('Response is not JSON');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

testSignup();
