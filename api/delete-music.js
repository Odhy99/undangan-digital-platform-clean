// api/delete-music.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { public_id, resource_type = 'auto' } = req.body;

  if (!public_id) {
    return res.status(400).json({ error: 'public_id required' });
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type,
    });

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('Cloudinary Error:', err);
    return res.status(500).json({ error: err.message });
  }
};
