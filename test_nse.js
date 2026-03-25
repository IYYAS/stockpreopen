import https from 'https';

function fetchNse(apiPath) {
    return new Promise((resolve, reject) => {
        const sessionOpts = {
            hostname: 'www.nseindia.com',
            path: '/',
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
        };

        https.get(sessionOpts, (res) => {
            const cookies = res.headers['set-cookie'];
            const cookieStr = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';

            const apiOpts = {
                hostname: 'www.nseindia.com',
                path: apiPath,
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Cookie': cookieStr,
                    'Referer': 'https://www.nseindia.com/'
                }
            };

            https.get(apiOpts, (apiRes) => {
                let data = '';
                apiRes.on('data', chunk => { data += chunk; });
                apiRes.on('end', () => {
                    resolve(data);
                });
            }).on('error', reject);
        }).on('error', reject);
    });
}

async function test() {
    const tests = [
        '/api/chart-data?symbol=MCXEQN&days=20Y&isHistory=true',
        '/api/chart-data?symbol=MCX&days=20Y&isHistory=true',
        '/api/chart-data?symbol=MCX&days=7300&isHistory=true',
        '/api/chart-data?symbol=RELIANCEEQN&days=7&isHistory=true'
    ];

    for (const path of tests) {
        console.log(`\nTesting: ${path}`);
        const result = await fetchNse(path);
        try {
            const json = JSON.parse(result);
            const count = json.grapthData ? json.grapthData.length : 0;
            const first = count > 0 ? new Date(json.grapthData[0][0]).toLocaleDateString() : 'N/A';
            const last = count > 0 ? new Date(json.grapthData[count-1][0]).toLocaleDateString() : 'N/A';
            console.log(`- Count: ${count}, First: ${first}, Last: ${last}`);
        } catch (e) {
            console.log(`- Failed to parse JSON. Snippet: ${result.substring(0, 50)}`);
        }
    }
}

test();
