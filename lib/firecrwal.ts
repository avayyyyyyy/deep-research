import FirecrawlApp from '@mendable/firecrawl-js';


const firecrawl = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_KEY ?? '',
    apiUrl: process.env.FIRECRAWL_BASE_URL,
  });

export default firecrawl;
