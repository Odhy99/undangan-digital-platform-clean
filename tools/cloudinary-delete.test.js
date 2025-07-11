// tools/cloudinary-delete.test.js
// Simple test for /delete-music endpoint
const axios = require('axios');

async function testDeleteMusic() {
  try {
    const res = await axios.post('http://localhost:4000/delete-music', {
      public_id: 'music_folder/testfile' // Ganti dengan public_id yang valid
    });
    console.log('Test success:', res.data);
  } catch (err) {
    console.error('Test failed:', err.response ? err.response.data : err.message);
  }
}

testDeleteMusic();
