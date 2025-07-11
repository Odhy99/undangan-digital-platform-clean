// tools/cloudinary-delete.js
require('dotenv').config();
const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.post('/delete-music', async (req, res) => {
  const { public_id, resource_type } = req.body;
  if (!public_id) return res.status(400).json({ error: 'public_id required' });

  const type = resource_type || 'auto';
  console.log('Request delete:', { public_id, resource_type: type });
  try {
    const result = await cloudinary.uploader.destroy(public_id, { resource_type: type });
    console.log('Cloudinary destroy result:', result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Cloudinary destroy error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Cloudinary delete API running on port ${PORT}`));
