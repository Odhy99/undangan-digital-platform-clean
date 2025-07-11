// tools/cloudinary-utils.js
// Utility to extract public_id from Cloudinary URL

function getCloudinaryPublicId(url) {
  // Example: https://res.cloudinary.com/xxx/video/upload/v1234567890/music_folder/myfile.mp3
  // public_id: music_folder/myfile
  if (!url) return null;
  try {
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    return null;
  } catch {
    return null;
  }
}

module.exports = { getCloudinaryPublicId };
