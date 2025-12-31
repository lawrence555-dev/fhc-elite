// News service using Google News search
// Parses the search results HTML for article links and titles

// Stock name mapping for news search
const STOCK_INFO = {
    '2881': { name: '富邦金', searchTerm: '富邦金' },
    '2882': { name: '國泰金', searchTerm: '國泰金' },
    '2891': { name: '中信金', searchTerm: '中信金' },
    '2886': { name: '兆豐金', searchTerm: '兆豐金' },
    '2885': { name: '元大金', searchTerm: '元大金' },
    '2884': { name: '玉山金', searchTerm: '玉山金' },
    '2892': { name: '第一金', searchTerm: '第一金' },
    '5880': { name: '合庫金', searchTerm: '合庫金' },
    '2880': { name: '華南金', searchTerm: '華南金' },
    '2887': { name: '台新新光金', searchTerm: '台新金' },
    '2890': { name: '永豐金', searchTerm: '永豐金' },
    '2883': { name: '開發金', searchTerm: '開發金' }
};

/**
 * Fetches news for a specific stock from Google News.
 * @param {string} stockCode - The stock code (e.g., '2881')
 * @returns {Promise<Array<{title: string, url: string, source: string, time: number}>>}
 */
export const getStockNews = async (stockCode) => {
    try {
        const stockInfo = STOCK_INFO[stockCode];
        const searchTerm = stockInfo ? stockInfo.searchTerm : stockCode;

        return await searchGoogleNews(searchTerm);
    } catch (error) {
        console.error(`Failed to fetch news for ${stockCode}:`, error);
        return [];
    }
};

/**
 * Fetches aggregated finance news from Google News.
 * @returns {Promise<Array<{title: string, url: string, source: string, time: number}>>}
 */
export const getFinanceNews = async () => {
    try {
        return await searchGoogleNews('金控');
    } catch (error) {
        console.error('Failed to fetch aggregated finance news:', error);
        return [];
    }
};

/**
 * Searches Google News and parses the results.
 * @param {string} query - The search query
 * @returns {Promise<Array<{title: string, url: string, source: string, time: number}>>}
 */
const searchGoogleNews = async (query) => {
    try {
        const encodedQuery = encodeURIComponent(query);
        const url = `/api/gnews/search?q=${encodedQuery}&hl=zh-TW&gl=TW&ceid=TW%3Azh-Hant`;

        const response = await fetch(url);
        const html = await response.text();

        return parseGoogleNewsHTML(html);
    } catch (error) {
        console.error('Google News search failed:', error);
        return [];
    }
};

/**
 * Parses Google News search results HTML.
 * Google News articles have links in format: href="./read/CBMi..."
 * Titles are in elements with jsaction="click:vMCBcb;" attribute
 */
const parseGoogleNewsHTML = (html) => {
    const news = [];
    const seenUrls = new Set();

    try {
        // Pattern: Find title and link pairs
        // Title format: jsaction="click:vMCBcb;">TITLE</a>
        // Link format: href="./read/CBMi...?hl=zh-TW..."

        // Extract all ./read/ links with their context
        const articlePattern = /href="(\.\/read\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
        let match;

        while ((match = articlePattern.exec(html)) !== null) {
            const relativePath = match[1];
            const title = match[2].trim();

            // Skip short titles or duplicates
            if (title.length < 10 || seenUrls.has(title)) continue;
            seenUrls.add(title);

            // Construct full URL
            // Convert &amp; to & and clean up the path
            const cleanPath = relativePath
                .replace(/&amp;/g, '&')
                .replace('./', '/');
            const fullUrl = `https://news.google.com${cleanPath}`;

            news.push({
                url: fullUrl,
                title: title,
                source: '綜合媒體',
                time: Date.now() // Google News doesn't easily expose timestamp in search HTML
            });
        }

        // Return top 10 unique articles
        return news.slice(0, 10);

    } catch (e) {
        console.error('Error parsing Google News:', e);
        return [];
    }
};
