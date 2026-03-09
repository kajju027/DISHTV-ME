const fs = require('fs');
const Parser = require('rss-parser');
const parser = new Parser();

// HTML ট্যাগ রিমুভ করার ফাংশন যাতে ওয়েবসাইটের ডিজাইন কোনোভাবেই না ভাঙে
function stripHtml(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
}

(async () => {
    try {
        const feed = await parser.parseURL('https://timesofindia.indiatimes.com/rssfeeds/4719148.cms');
        let newsCardsHtml = '';

        feed.items.forEach(item => {
            // সঠিক ইমেজ বের করা
            let imgUrl = 'https://via.placeholder.com/600x400?text=Sports+News';
            if (item.enclosure && item.enclosure.url) {
                imgUrl = item.enclosure.url;
            } else if (item.content && item.content.includes('src=')) {
                const match = item.content.match(/src="([^"]+)"/);
                if (match) imgUrl = match[1];
            }

            // ডেসক্রিপশন থেকে আজেবাজে কোড সরিয়ে পরিষ্কার টেক্সট নেওয়া (সর্বোচ্চ ১২০ অক্ষর)
            let cleanDesc = stripHtml(item.contentSnippet || item.content);
            if (cleanDesc.length > 120) {
                cleanDesc = cleanDesc.substring(0, 120) + '...';
            }

            // নিউজ কার্ডের HTML
            newsCardsHtml += `
            <article class="news-card">
                <img src="${imgUrl}" alt="News Image" class="news-image">
                <div class="news-content">
                    <span class="badge">SPORTS</span>
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
    <title>CRICKET  NEWS POINT| Sayan Official</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f4f7f6; color: #1a1a1a; line-height: 1.6; }
        
        /* Header Style */
        header { background: #fff; padding: 20px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100; }
        .signature { font-size: 12px; font-weight: 800; color: #d63031; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 5px; }
        h1 { font-size: 24px; font-weight: 800; color: #111; }
        
        /* Grid Layout for News */
        .main-container { max-width: 1200px; margin: 40px auto; padding: 0 20px; }
        .news-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; }
        
        /* Card Style */
        .news-card { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.3s ease, box-shadow 0.3s ease; display: flex; flex-direction: column; border: 1px solid #eaeaea; }
        .news-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .news-image { width: 100%; height: 220px; object-fit: cover; display: block; border-bottom: 1px solid #eee; background-color: #f0f0f0; }
        .news-content { padding: 20px; display: flex; flex-direction: column; flex-grow: 1; }
        
        /* Text & Badge Style */
        .badge { background: #ffeaa7; color: #d35400; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 1px; display: inline-block; margin-bottom: 15px; align-self: flex-start; }
        .news-title { font-size: 18px; font-weight: 700; color: #2d3436; margin-bottom: 10px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .news-desc { font-size: 14px; color: #636e72; margin-bottom: 20px; flex-grow: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        
        /* Button Style */
        .read-btn { display: inline-block; background: #000; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; transition: background 0.3s ease; width: 100%; }
        .read-btn:hover { background: #333; }
        
        /* Mobile Optimization */
        @media (max-width: 600px) { 
            .main-container { margin: 20px auto; } 
            .news-grid { gap: 20px; } 
            h1 { font-size: 20px; } 
        }
    </style>
</head>
<body>
    <header>
        <span class="signature">Powered By TOI</span>
        <h1>CRICKET NEWS POINT</h1>
    </header>
    <main class="main-container">
        <div class="news-grid">
            ${newsCardsHtml}
        </div>
    </main>
</body>
</html>`;


        fs.writeFileSync('index.html', fullHtml);
        console.log('Premium UI Updated Successfully!');
    } catch (error) {
        console.error('Extraction Error:', error);
    }
})();
