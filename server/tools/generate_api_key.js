import crypto from 'crypto';

function generateKey(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

const key = generateKey(32);
console.log('Generated API key (add this to your .env as API_KEY):\n');
console.log(key);
console.log('\nExample .env line:\nAPI_KEY=' + key + '\n');
