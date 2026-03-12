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
            'https://timesofindia.indiatimes.com/rssfeedmostread.cms'
        ];

        let allNews = [];

        for (const url of feeds) {
            const feed = await parser.parseURL(url);
            allNews = allNews.concat(feed.items);
        }

        allNews.sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));

        let newsCardsHtml = '';

        allNews.forEach(item => {
            let imgUrl = 'https://cnpoint.pages.dev/Photo/file_0000000040247208bac79a46b2a55a4a.png';
            if (item.enclosure && item.enclosure.url) {
                imgUrl = item.enclosure.url;
            } else if (item.content && item.content.includes('src=')) {
                const match = item.content.match(/src=["']([^"']+)["']/);
                if (match) imgUrl = match[1];
            } else if (item.description && item.description.includes('src=')) {
                const match = item.description.match(/src=["']([^"']+)["']/);
                if (match) imgUrl = match[1];
            }

            let cleanDesc = stripHtml(item.contentSnippet || item.description || item.content);
            if (cleanDesc.length > 140) {
                cleanDesc = cleanDesc.substring(0, 140) + '...';
            }
            
            const publishDate = formatDate(item.pubDate);

            newsCardsHtml += `
            <article class="news-card">
                <div class="image-wrapper">
                    <img src="${imgUrl}" alt="News Image" class="news-image" loading="lazy">
                    <span class="badge">LATEST</span>
                </div>
                <div class="news-content">
                    <h2 class="news-title">${item.title}</h2>
                    <p class="news-desc">${cleanDesc}</p>
                    <div class="card-footer">
                        <span class="date-text">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            ${publishDate}
                        </span>
                        <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="read-btn">Read More</a>
                    </div>
                </div>
            </article>`;
        });

        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Cricket News Point | Cnptv | Sayan Official</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f0f2f5; color: #1c1e21; -webkit-font-smoothing: antialiased; }
        
        header { background: #ffffff; padding: 16px 20px; text-align: center; position: sticky; top: 0; z-index: 100; border-bottom: 1px solid #e4e6eb; }
        .signature { font-size: 11px; font-weight: 700; color: #e50914; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 4px; }
        h1 { font-size: 22px; font-weight: 800; color: #050505; letter-spacing: -0.5px; }
        
        .main-container { width: 100%; max-width: 1280px; margin: 0 auto; padding: 24px 16px; }
        .news-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        
        .news-card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); display: flex; flex-direction: column; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .news-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
        
        .image-wrapper { position: relative; width: 100%; padding-top: 56.25%; background-color: #e4e6eb; }
        .news-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
        .badge { position: absolute; top: 12px; left: 12px; background: rgba(229, 9, 20, 0.9); color: #ffffff; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; backdrop-filter: blur(4px); }
        
        .news-content { padding: 16px; display: flex; flex-direction: column; flex-grow: 1; }
        .news-title { font-size: 17px; font-weight: 700; color: #050505; margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .news-desc { font-size: 14px; color: #65676b; margin-bottom: 16px; line-height: 1.5; flex-grow: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        
        .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 16px; border-top: 1px solid #f0f2f5; }
        .date-text { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #65676b; font-weight: 500; }
        .read-btn { background: #e4e6eb; color: #050505; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; transition: background 0.2s ease; }
        .read-btn:hover { background: #d8dadf; }

        @media (min-width: 640px) {
            .news-grid { grid-template-columns: repeat(2, 1fr); }
        }
        
        @media (min-width: 1024px) {
            .news-grid { grid-template-columns: repeat(3, 1fr); gap: 32px; padding: 32px 24px; }
            h1 { font-size: 28px; }
            .news-title { font-size: 19px; }
            .news-desc { font-size: 15px; }
            .read-btn { padding: 10px 20px; font-size: 14px; }
        }
    </style>
</head>
<body>
    <header>
        <span class="signature"></span>
        <h1>CRICKET NEWS POINT</h1>
    </header>
    <main class="main-container">
        <div class="news-grid">
            ${newsCardsHtml}
        </div>
    </main>
</body>
</html>`;

        fs.writeFileSync('cricket-news-point.html', fullHtml);
    } catch (error) {
        process.exit(1);
    }
})();

