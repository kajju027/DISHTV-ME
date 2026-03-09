const fs = require('fs');
const Parser = require('rss-parser');
const parser = new Parser();

function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
}

function formatDate(dateString) {
    if (!dateString) return 'Recently Updated';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

(async () => {
    try {
        const feeds = [
            'https://timesofindia.indiatimes.com/rssfeeds/4719148.cms',
            'https://timesofindia.indiatimes.com/rssfeedmostread.cms',
            'https://timesofindia.indiatimes.com/rssfeeds/54829575.cms'
        ];

        let allNews = [];

        for (const url of feeds) {
            const feed = await parser.parseURL(url);
            allNews = allNews.concat(feed.items);
        }

        allNews.sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));

        let newsCardsHtml = '';

        allNews.forEach(item => {
            let imgUrl = 'https://via.placeholder.com/600x400?text=News+Update';
            if (item.enclosure && item.enclosure.url) {
                imgUrl = item.enclosure.url;
            } else if (item.content && item.content.includes('src=')) {
                const match = item.content.match(/src="([^"]+)"/);
                if (match) imgUrl = match[1];
            } else if (item.description && item.description.includes('src=')) {
                const match = item.description.match(/src="([^"]+)"/);
                if (match) imgUrl = match[1];
            }

            let cleanDesc = stripHtml(item.contentSnippet || item.description || item.content);
            if (cleanDesc.length > 120) {
                cleanDesc = cleanDesc.substring(0, 120) + '...';
            }
            
            const publishDate = formatDate(item.pubDate);

            newsCardsHtml += `
            <article class="news-card">
                <img src="${imgUrl}" alt="News Image" class="news-image">
                <div class="news-content">
                    <div class="card-meta">
                        <span class="badge">LATEST</span>
                        <span class="date-text">${publishDate}</span>
                    </div>
                    <h2 class="news-title">${item.title}</h2>
                    <p class="news-desc">${cleanDesc}</p>
                    <a href="${item.link}" target="_blank" class="read-btn">Read Full Story</a>
                </div>
            </article>`;
        });

        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cricket News Point| Sayan Official</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f4f7f6; color: #1a1a1a; line-height: 1.6; }
        
        header { background: #fff; padding: 20px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100; }
        .signature { font-size: 12px; font-weight: 800; color: #d63031; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 5px; }
        h1 { font-size: 24px; font-weight: 800; color: #111; }
        
        .main-container { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
        .news-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; }
        
        .news-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.3s ease, box-shadow 0.3s ease; display: flex; flex-direction: column; border: 1px solid #eaeaea; }
        .news-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .news-image { width: 100%; height: 220px; object-fit: cover; display: block; border-bottom: 1px solid #eee; background-color: #f0f0f0; }
        .news-content { padding: 20px; display: flex; flex-direction: column; flex-grow: 1; }
        
        .card-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .badge { background: #ffeaa7; color: #d35400; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; }
        .date-text { font-size: 12px; color: #888; font-weight: 600; }
        
        .news-title { font-size: 18px; font-weight: 700; color: #2d3436; margin-bottom: 10px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .news-desc { font-size: 14px; color: #636e72; margin-bottom: 20px; flex-grow: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        
        .read-btn { display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; transition: background 0.3s ease; width: 100%; }
        .read-btn:hover { background: #333; }
        
        @media (max-width: 600px) { 
            .main-container { margin: 20px auto; } 
            .news-grid { gap: 20px; } 
            h1 { font-size: 20px; } 
        }
    </style>
</head>
<body>
    <header>
        <span class="signature">Powered by TOI</span>
        <h1>Latest World Updates</h1>
    </header>
    <main class="main-container">
        <div class="news-grid">
            ${newsCardsHtml}
        </div>
    </main>
</body>
</html>`;

        fs.writeFileSync('index.html', fullHtml);
    } catch (error) {
    }
})();
