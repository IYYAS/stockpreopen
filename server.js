import express from 'express';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Allow CORS for the local React dev server
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Helper: first get NSE session cookie by visiting the homepage,
// then fetch the API with that cookie (exactly how a browser would do it)
// Support custom headers and an optional 'refererPath' to establish session
function fetchWithNseSession(apiPath, customHeaders = {}, refererPath = '/') {
    return new Promise((resolve, reject) => {
        const sessionOpts = {
            hostname: 'www.nseindia.com',
            path: refererPath,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive'
            }
        };

        const sessionReq = https.request(sessionOpts, (sessionRes) => {
            sessionRes.resume();
            const cookies = sessionRes.headers['set-cookie'];
            const cookieStr = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';

            // Now hit the actual API with the session cookies and a small delay
            setTimeout(() => {
                const apiOpts = {
                    hostname: 'www.nseindia.com',
                    path: apiPath,
                    method: 'GET',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Referer': 'https://www.nseindia.com' + refererPath,
                        'Connection': 'keep-alive',
                        'Cookie': cookieStr,
                        ...customHeaders
                    }
                };

                const apiReq = https.request(apiOpts, (apiRes) => {
                    let data = '';
                    apiRes.on('data', chunk => { data += chunk; });
                    apiRes.on('end', () => {
                        if (!data || data.trim() === '') return reject(new Error('Empty response'));
                        try { resolve(JSON.parse(data)); }
                        catch (e) { reject(new Error(`Failed to parse NSE response as JSON`)); }
                    });
                });
                apiReq.on('error', reject);
                apiReq.end();
            }, 100);
        });
        sessionReq.on('error', reject);
        sessionReq.end();
    });
}

// GET /api/pre-open?key=FO
app.get('/api/pre-open', async (req, res) => {
    const key = req.query.key || 'FO';
    const path = `/api/market-data-pre-open?key=${key}`;
    console.log(`[${new Date().toISOString()}] Fetching: ${path}`);

    try {
        const data = await fetchWithNseSession(path);
        res.json(data);
        console.log(`[OK] ${data?.data?.length ?? '?'} records returned`);
    } catch (err) {
        console.error('[ERROR]', err.message);
        res.status(502).json({ error: err.message });
    }
});

// GET /api/chart-data?symbol=ONGCEQN&days=1D
app.get('/api/chart-data', async (req, res) => {
    try {
        const { symbol, days = '1D' } = req.query;
        if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

        const isLongTimeframe = days !== '1D';
        const stockUrl = `/get-quotes/equity?symbol=${encodeURIComponent(symbol.replace('EQN', ''))}`;
        
        // Use the verified successful official endpoint
        let path = `/api/NextApi/apiClient/GetQuoteApi?functionName=getSymbolChartData&symbol=${symbol}&days=${days}`;
        
        console.log(`[${new Date().toISOString()}] Fetching Chart (${days}): ${path}`);
        
        // We establish a context-aware session by "visiting" the stock page first
        let data = await fetchWithNseSession(path, {}, stockUrl);

        // Fallback for symbols that don't support 20Y on the standard endpoint
        if (isLongTimeframe && (!data?.grapthData || data.grapthData.length < 5 || data.grapthData.some(d => d[2] === 'PO'))) {
            console.log(`[Proxy] Normal API failed for ${symbol} 20Y. Trying direct historical endpoint...`);
            const fallbackPath = `/api/chart-data?symbol=${symbol}&days=${days}&isHistory=true`;
            const fallbackData = await fetchWithNseSession(fallbackPath, {}, stockUrl);
            if (fallbackData?.grapthData && fallbackData.grapthData.length > 5) {
                data = fallbackData;
            }
        }

        res.json(data);
    } catch (error) {
        console.error('[ERROR Chart]', error.message);
        res.status(502).json({ error: error.message });
    }
});

// GET /api/news-feed
app.get('/api/news-feed', async (req, res) => {
    const page = req.query.page || 1;
    const size = req.query.size || 50;
    const publisherId = req.query.publisherId || 'stocknewssummary';
    
    const url = `https://groww.in/v2/api/feed/public?page=${page}&publisherId=${publisherId}&size=${size}`;
    console.log(`[${new Date().toISOString()}] Fetching News: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Groww API returned ${response.status}`);
        const data = await response.json();
        res.json(data);
        console.log(`[OK] News feed returned ${data?.feed?.length ?? 0} items`);
    } catch (err) {
        console.error('[ERROR News]', err.message);
        res.status(502).json({ error: err.message });
    }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\nNSE Proxy Server running at http://localhost:${PORT}`);
    console.log(`Test: http://localhost:${PORT}/api/pre-open?key=FO\n`);
});
