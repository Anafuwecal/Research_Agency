import './src/config/env.js';
import { ChatGroq } from '@langchain/groq';

async function testGroq() {
  console.log('Testing Groq API...\n');
  console.log('API Key:', process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.substring(0, 20)}...` : 'NOT SET');

  if (!process.env.GROQ_API_KEY) {
    console.error('\nGROQ_API_KEY is not set in your .env file!');
    process.exit(1);
  }

  try {
    const model = new ChatGroq({
      model: 'llama-3.3-70b-versatile',
      apiKey: process.env.GROQ_API_KEY,
      temperature: 0.7,
    });

    console.log('\nSending test request to Groq...');
    const response = await model.invoke('Say "Hello, Groq is working!" and nothing else.');
    
    console.log('\n✓ SUCCESS! Groq API is working');
    console.log('Response:', response.content);
    console.log('\nYour Groq API key is valid and working correctly.');
    
  } catch (error: any) {
    console.error('\n✗ FAILED! Groq API error:');
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Invalid API key');
    console.error('2. API key has no credits/usage quota');
    console.error('3. Network/firewall blocking access to groq.com');
    console.error('4. VPN or proxy interference');
    console.error('\nPlease:');
    console.error('- Check your API key at https://console.groq.com/keys');
    console.error('- Verify you have usage credits');
    console.error('- Try disabling VPN/proxy if you\'re using one');
  }
}

testGroq();