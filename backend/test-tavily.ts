import './src/config/env.js';
import { tavily } from '@tavily/core';

async function testTavily() {
  console.log('Testing Tavily Search API...\n');

  const apiKey = process.env.TAVILY_API_KEY;
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT SET');

  if (!apiKey) {
    console.error('\nTAVILY_API_KEY is not set in your .env file!');
    console.error('Get your API key from: https://tavily.com/');
    return;
  }

  try {
    const client = tavily({ apiKey });

    console.log('\nSearching for: "artificial intelligence impact on education"...');
    
    const response = await client.search('artificial intelligence impact on education', {
      search_depth: 'basic',
      max_results: 5,
      include_answer: true,
    });

    console.log('\n✓ SUCCESS!');
    console.log(`Found ${response.results.length} results`);
    
    if (response.answer) {
      console.log('\nTavily Answer:');
      console.log(response.answer.substring(0, 200) + '...');
    }

    console.log('\nTop 3 Results:');
    response.results.slice(0, 3).forEach((result: any, i: number) => {
      console.log(`\n${i + 1}. ${result.title}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Score: ${result.score}`);
      console.log(`   Content: ${result.content.substring(0, 150)}...`);
    });

    console.log('\n✓ Tavily is working correctly!');

  } catch (error: any) {
    console.error('\n✗ FAILED!');
    console.error('Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. Your Tavily API key is correct');
    console.error('2. You have API credits available');
    console.error('3. Your internet connection is working');
  }
}

testTavily();