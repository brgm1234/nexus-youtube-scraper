const { Actor } = require('apify');
const axios = require('axios');
const cheerio = require('cheerio');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { keywords, maxVideos = 30, sortBy = 'relevance' } = input;
  
  console.log('Starting YouTube scraper...');
  console.log('Keywords:', keywords);
  console.log('Max videos:', maxVideos);
  console.log('Sort by:', sortBy);
  
  const results = [];
  const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['BUYPROXIES94952']
  });
  
  for (const keyword of keywords) {
    if (results.length >= maxVideos) break;
    
    try {
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}&sp=${sortBy === 'date' ? 'CAISAhAB' : ''}`;
      
      const response = await axios.get(searchUrl, {
        proxy: proxyConfiguration.createProxyUrl(),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      const $ = cheerio.load(response.data);
      const scripts = $('script').toArray();
      
      let ytData = null;
      for (const script of scripts) {
        const text = $(script).html() || '';
        if (text.includes('var ytInitialData')) {
          const match = text.match(/var ytInitialData = ({.+?});/);
          if (match) {
            ytData = JSON.parse(match[1]);
            break;
          }
        }
      }
      
      if (ytData) {
        const contents = ytData.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
        
        for (const section of contents) {
          const items = section.itemSectionRenderer?.contents || [];
          
          for (const item of items) {
            if (results.length >= maxVideos) break;
            
            const videoRenderer = item.videoRenderer;
            if (videoRenderer) {
              const videoId = videoRenderer.videoId;
              const title = videoRenderer.title?.runs?.[0]?.text || '';
              const views = videoRenderer.viewCountText?.simpleText || '';
              const channel = videoRenderer.ownerText?.runs?.[0]?.text || '';
              const uploadDate = videoRenderer.publishedTimeText?.simpleText || '';
              const thumbnail = videoRenderer.thumbnail?.thumbnails?.[0]?.url || '';
              
              results.push({
                title,
                views,
                channel,
                uploadDate,
                videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
                thumbnail,
                keyword
              });
            }
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error scraping keyword "${keyword}":`, error.message);
    }
  }
  
  await Actor.pushData(results);
  console.log('Scraping completed. Total results:', results.length);
});