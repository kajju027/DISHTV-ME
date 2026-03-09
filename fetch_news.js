const fs = require('fs');
const Parser = require('rss-parser');
const parser = new Parser();

(async () => {
    try {
        const feed = await parser.parseURL('https://timesofindia.indiatimes.com/rssfeeds/4719148.cms');
        let newsCardsHtml = '';

        feed.items.forEach(item => {
            let imgUrl = 'https://via.placeholder.com/600x400?text=Sports+News';
            if (item.enclosure && item.enclosure.url) {
                imgUrl = item.enclosure.url;
            } else if (item.content && item.content.includes('src=')) {
                const match = item.content.match(/src="([^"]+)"/);
                if (match) imgUrl = match[1];
            }

            const cleanDesc = item.contentSnippet ? item.contentSnippet.split('.')[0] + '.' : 'Click to read details.';

            newsCardsHtml += `
        <div class="news-card">
            <img src="${imgUrl}" alt="sports image">
            <div class="content">
                <span class="badge">SPORTS</span>
                <h2 class="news-title">${item.title}</h2>
                <p class="news-desc">${cleanDesc}</p>
                <a href="${item.link}" target="_blank" class="read-btn">Read Full Story</a>
            </div>
        </div>`;
        });

        // এখানে আপনার ওয়েবসাইটের সম্পূর্ণ ডিজাইন এবং CSS দেওয়া আছে
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sports Pulse | Sayan Official</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        :root { --primary: #000; --secondary: #636e72; --accent: #d63031; --bg: #fdfdfd; }
        body { margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--primary); }
        header { padding: 30px 20px; text-align: center; background: #fff; border-bottom: 1px solid #eee; position: sticky; top: 0; z-index: 100;}
        .signature { font-size: 11px; font-weight: 800; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; display: block; margin-bottom: 8px; }
        h1 { margin: 0; font-size: 26px; font-weight: 800; }
        .news-container { max-width: 500px; margin: 20px auto; padding: 0 15px; }
        .news-card { background: #fff; border-radius: 16px; margin-bottom: 30px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; }
        .news-card img { width: 100%; height: 240px; object-fit: cover; }
        .content { padding: 20px; }
        .badge { background: #f1f2f6; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; color: var(--secondary); margin-bottom: 12px; display: inline-block; }
        .news-title { font-size: 18px; line-height: 1.4; font-weight: 700; margin: 0 0 12px 0; color: #111; }
        .news-desc { font-size: 14px; color: var(--secondary); line-height: 1.6; margin-bottom: 18px; }
        .read-btn { display: block; text-decoration: none; background: var(--primary); color: #fff; text-align: center; padding: 12px; border-radius: 10px; font-weight: 600; font-size: 14px; transition: 0.3s; }
    </style>
</head>
<body>
    <header>
        <span class="signature">Powered by Sayan</span>
        <h1>Sports News Update</h1>
    </header>
    <div class="news-container">
${newsCardsHtml}
    </div>
</body>
</html>`;

        // সম্পূর্ণ নতুন করে index.html রাইট করা হচ্ছে
        fs.writeFileSync('index.html', fullHtml);
        console.log('Design and News Updated Successfully!');
    } catch (error) {
        console.error('Extraction Error:', error);
    }
})();
