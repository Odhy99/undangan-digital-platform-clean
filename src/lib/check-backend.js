// src/lib/check-backend.js
// Simple utility to check if backend Cloudinary delete API is running
export async function isBackendOnline() {
  try {
    const res = await fetch('http://localhost:4000/delete-music', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: 'test' })
    });
    return res.ok;
  } catch {
    return false;
  }
}
