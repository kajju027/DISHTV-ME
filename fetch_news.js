const fs = require('fs');
const Parser = require('rss-parser');
const parser = new Parser();

(async () => {
    try {
        // স্পোর্টস আরএসএস লিঙ্ক
        const feed = await parser.parseURL('https://timesofindia.indiatimes.com/rssfeeds/4719148.cms');
        let newsHtml = '';

        feed.items.forEach(item => {
            // ইমেজ এক্সট্রাকশন (TOI enclosure ট্যাগ ব্যবহার করে)
            let imgUrl = 'https://via.placeholder.com/600x400?text=Sports+News';
            if (item.enclosure && item.enclosure.url) {
                imgUrl = item.enclosure.url;
            } else if (item.content && item.content.includes('src=')) {
                // কিছু ক্ষেত্রে ডেসক্রিপশনে ইমেজ থাকে
                const match = item.content.match(/src="([^"]+)"/);
                if (match) imgUrl = match[1];
            }

            // ক্লিন ডেসক্রিপশন (HTML ট্যাগ রিমুভ করা)
            const cleanDesc = item.contentSnippet ? item.contentSnippet.split('.')[0] + '.' : 'Click to read details.';

            newsHtml += `
            <div class="news-card">
                <img src="${imgUrl}" alt="sports image">
                <div class="content">
                    <span class="badge">SPORTS</span>
                    <h2 class="news-title">${item.title}</h2>
                    <p class="news-desc">${cleanDesc}</p>
                    <a href="${item.link}" target="_blank" class="read-btn">Read Full Story</a>
                </div>
            </div>\n`;
        });

        const indexFile = fs.readFileSync('index.html', 'utf8');
        const startMarker = '';
        const endMarker = '';

        // ডাটা রিপ্লেস করার লজিক
        const parts = indexFile.split(startMarker);
        const secondPart = parts[1].split(endMarker);
        
        const updatedHtml = parts[0] + startMarker + '\n' + newsHtml + endMarker + secondPart[1];

        fs.writeFileSync('index.html', updatedHtml);
        console.log('Successfully Updated Sports News!');
    } catch (error) {
        console.error('Extraction Error:', error);
    }
})();
