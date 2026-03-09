const fs = require('fs');
const Parser = require('rss-parser');
const parser = new Parser();

(async () => {
    try {
        const feed = await parser.parseURL('https://timesofindia.indiatimes.com/rssfeedstopstories.cms');
        let newsHtml = '';

        feed.items.forEach(item => {
            // পোস্টার ইমেজ এক্সট্রাক্ট করা
            const imgUrl = item.enclosure ? item.enclosure.url : 'https://via.placeholder.com/600x400?text=No+Image';
            
            newsHtml += `
            <div class="news-card">
                <img src="${imgUrl}" alt="news">
                <div class="news-content">
                    <h2 class="news-title">${item.title}</h2>
                    <p class="news-desc">${item.contentSnippet || 'No description available.'}</p>
                    <a href="${item.link}" target="_blank" class="read-more">Read Full Story →</a>
                </div>
            </div>\n`;
        });

        const indexFile = fs.readFileSync('index.html', 'utf8');
        const startMarker = '';
        const endMarker = '';

        const updatedHtml = indexFile.split(startMarker)[0] + startMarker + '\n' + newsHtml + endMarker + indexFile.split(endMarker)[1];

        fs.writeFileSync('index.html', updatedHtml);
        console.log('News updated successfully!');
    } catch (error) {
        console.error('Error:', error);
    }
})();

