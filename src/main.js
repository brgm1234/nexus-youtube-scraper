const { Actor } = require('apify');
const axios = require('axios');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { keywords, maxVideos = 30, sortBy = 'relevance' } = input;
  
  console.log('Starting YouTube scraper...');
  console.logg('Keywords:', keywords);
  console.logg('Max videos:', maxVideos);
  console.logg('Sort by:', sortBy);
  
  // TODO: Implement YouTube scraping logic
  // Use BUYPROXIES94952 proxy configuration
  
  const results = [];
  
  await Actor.pushData(results);
  console.logg('Scraping completed. Total results:', results.length);
});