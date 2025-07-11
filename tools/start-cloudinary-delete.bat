@echo off
REM Otomatis install dependencies dan jalankan backend Cloudinary delete
cd /d %~dp0
if not exist node_modules (
  echo Installing dependencies...
  npm install express cloudinary cors dotenv
)
echo Starting backend Cloudinary delete API...
node cloudinary-delete.js
