import './src/config/env.js';
import axios from 'axios';

async function testGoogleSearch() {
  console.log('Testing Google Custom Search API...\n');
  
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const engineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

  console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT SET');
  console.log('Engine ID:', engineId || 'NOT SET');

  if (!apiKey || !engineId) {
    console.error('\nMissing Google Search credentials!');
    console.error('Please set GOOGLE_SEARCH_API_KEY and GOOGLE_SEARCH_ENGINE_ID in your .env file');
    return;
  }

  try {
    console.log('\nSending test search request...');
    const response = await axios.get(
      'https://www.googleapis.com/customsearch/v1',
      {
        params: {
          key: apiKey,
          cx: engineId,
          q: 'artificial intelligence',
          num: 5,
        },
      }
    );

    console.log('\n✓ SUCCESS!');
    console.log(`Found ${response.data.items.length} results`);
    console.log('\nFirst 3 results:');
    response.data.items.slice(0, 3).forEach((item: any, i: number) => {
      console.log(`${i + 1}. ${item.title}`);
      console.log(`   ${item.link}`);
    });

  } catch (error: any) {
    console.error('\n✗ FAILED!');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data?.error || error.message);
    console.error('\nPlease check:');
    console.error('1. Your Google Search API key is valid');
    console.error('2. Custom Search API is enabled');
    console.error('3. Your Search Engine ID is correct');
  }
}

testGoogleSearch();