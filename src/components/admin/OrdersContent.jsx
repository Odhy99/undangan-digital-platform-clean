import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { getAllOrders, deleteOrder, updateOrder, getAllMusic } from '@/lib/firestore';

// Ambil info user login dari localStorage
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('adminUser')) || null;
  } catch {
    return null;
  }
}

const OrdersContent = ({ orders, setOrders, templates }) => {
  const { toast } = useToast();
  let currentUser = getCurrentUser();
  // Hapus akun admin dari localStorage jika ada
  if (currentUser && currentUser.type === 'admin') {
    localStorage.removeItem('adminUser');
    currentUser = null;
  }
  const [loading, setLoading] = useState(false);

  // State untuk daftar musik
  const [musicList, setMusicList] = useState([]);

  // Fetch music dari Firestore saat mount
  useEffect(() => {
    getAllMusic().then(setMusicList).catch(() => setMusicList([]));
  }, []);

  // Fetch orders dari Firestore saat mount
  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const data = await getAllOrders();
        setOrders(data);
      } catch (err) {
        toast({ title: 'Gagal memuat pesanan', description: err.message || String(err), variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  // Hapus order di Firestore
  const handleDelete = async (orderId) => {
    setLoading(true);
    try {
      // Gunakan Firestore doc ID langsung, tidak perlu validasi manual
      await deleteOrder(orderId);
      // Setelah delete, fetch ulang orders dari Firestore agar sinkron
      const updatedOrders = await getAllOrders();
      setOrders(updatedOrders);
      toast({
        title: 'Pesanan Dihapus',
        description: `Pesanan dengan ID ${orderId} telah dihapus dari database (cloud).`,
      });
    } catch (err) {
      console.error('[ERROR] Gagal menghapus order:', err);
      toast({ title: 'Gagal menghapus pesanan', description: err.message || String(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Proses order: update status di Firestore
  const handleProcess = async (orderId) => {
    setLoading(true);
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      // Generate slug unik dari nama panggilan kedua mempelai, gunakan & di tengah, dan tambahkan angka jika sudah ada yang sama
      const slugify = str => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const baseSlug = slugify(`${order.groomNickname || ''} & ${order.brideNickname || ''}`);
      // Cari slug yang sudah ada di orders (kecuali order ini sendiri)
      const existingSlugs = orders
        .filter(o => o.id !== orderId && o.invitationLink && typeof o.invitationLink === 'string')
        .map(o => {
          const match = o.invitationLink.match(/\/invitation\/([^/?#]+)/);
          return match ? match[1] : null;
        })
        .filter(Boolean);
      let coupleSlug = baseSlug;
      let counter = 2;
      while (existingSlugs.includes(coupleSlug)) {
        coupleSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      const invitationLink = `${window.location.origin}/invitation/${coupleSlug}`;
      // --- GENERATE INVITATION HTML (REPLACE PLACEHOLDER) ---
      let finalHtml = '';
      const template = templates.find(t => t.id === order.templateId);
      if (template) {
        let html = template.html || '';
        Object.entries(order).forEach(([key, value]) => {
          if (key === 'weddingGifts' || key === 'musicUrl') return;
          if (typeof value === 'object' && value !== null) return;
          const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
          html = html.replace(regex, value ?? '');
        });
        // Ambil url musik dari state musicList (Firestore)
        let musicUrl = '';
        if (order.selectedMusic && Array.isArray(musicList)) {
          const found = musicList.find(m => m.id === order.selectedMusic);
          if (found && found.url) musicUrl = found.url;
        }
        html = html.replace(/{{\\s*musicUrl\\s*}}/g, musicUrl);
        // --- Inject Audio Tag + Sticky Play/Pause Button ---
        let audioTag = '';
        if (musicUrl) {
          audioTag = `\n<audio id="wedding-music" src="${musicUrl}" style="display:none" preload="auto" loop></audio>\n<button id="music-toggle-btn" style="position:fixed;right:24px;bottom:24px;width:56px;height:56px;border-radius:50%;background:#8b5cf6;box-shadow:0 2px 8px #0002;display:flex;align-items:center;justify-content:center;z-index:9999;border:none;cursor:pointer;outline:none;">\n  <svg id="music-play-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21 5,3"/></svg>\n  <svg id="music-pause-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24" style="display:none;"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>\n</button>\n<script>(function(){\n  var audio = document.getElementById('wedding-music');\n  var toggleBtn = document.getElementById('music-toggle-btn');\n  var playIcon = document.getElementById('music-play-icon');\n  var pauseIcon = document.getElementById('music-pause-icon');\n  var isPlaying = false;\n  function updateBtn() {\n    if(isPlaying) { playIcon.style.display = 'none'; pauseIcon.style.display = ''; }\n    else { playIcon.style.display = ''; pauseIcon.style.display = 'none'; }\n  }\n  function playMusic() { if(audio && audio.src) { audio.play(); isPlaying = true; updateBtn(); } }\n  function pauseMusic() { if(audio) { audio.pause(); isPlaying = false; updateBtn(); } }\n  toggleBtn.onclick = function() { if(isPlaying) { pauseMusic(); } else { playMusic(); } };\n  if(audio) {\n    audio.addEventListener('play', function(){ isPlaying = true; updateBtn(); });\n    audio.addEventListener('pause', function(){ isPlaying = false; updateBtn(); });\n    audio.addEventListener('ended', function(){ isPlaying = false; updateBtn(); });\n  }\n  document.body.addEventListener('click', function playMusicOnce(){\n    if(audio && !isPlaying) { playMusic(); }\n    document.body.removeEventListener('click', playMusicOnce);\n  });\n  document.addEventListener('visibilitychange', function(){\n    if(document.hidden && audio && !audio.paused) { pauseMusic(); }\n  });\n  updateBtn();\n})();<\/script>`;
        }
        // Handle weddingGifts: array or string
        let weddingGiftsArr = order.weddingGifts;
        if (typeof weddingGiftsArr === 'string') {
          try {
            weddingGiftsArr = JSON.parse(weddingGiftsArr);
            if (!Array.isArray(weddingGiftsArr)) weddingGiftsArr = [];
          } catch {
            weddingGiftsArr = [];
          }
        }
        const validGifts = (weddingGiftsArr || []).filter(gift => (gift && typeof gift === 'object' && (gift.name || gift.account || gift.holder)));
        if (validGifts.length > 0) {
          const gifts = validGifts.map((gift, idx, arr) => {
            const isEwallet = gift.type === 'ewallet';
            const icon = isEwallet
              ? '<svg width="20" height="20" fill="none" stroke="#06b6d4" stroke-width="2" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:8px;"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M16 11h2a1 1 0 0 1 0 2h-2z"/></svg>'
              : '<svg width="20" height="20" fill="none" stroke="#4f46e5" stroke-width="2" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:8px;"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 11h4a1 1 0 0 1 0 2H6z"/></svg>';
            const copyBtn = gift.account ? `<button type=\"button\" class=\"btn-copy-account\" data-account=\"${gift.account}\" style=\"margin-left:8px;padding:2px 10px;font-size:0.95rem;border:none;background:#f1f5f9;color:#2563eb;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:background .2s;\"><svg width=16 height=16 fill=none stroke='\#2563eb' stroke-width=2 viewBox='0 0 24 24'><rect x='9' y='9' width='13' height='13' rx='2'/><path d='M5 15V5a2 2 0 0 1 2-2h10'/></svg> <span>Salin</span></button>` : '';
            return `<div class=\"gift-item\" style=\"display:flex;align-items:flex-start;padding:16px 0;${idx<arr.length-1?'border-bottom:1px solid #e5e7eb;':''}\">\n            <div style=\"margin-right:12px;\">${icon}</div>\n            <div style=\"flex:1;min-width:0;\">\n              <div style=\"font-weight:600;font-size:1rem;color:#111827;\">${isEwallet ? 'E-Wallet' : 'Bank'}: ${gift.name || '-'}<\/div>\n              <div style=\"color:#374151;font-size:0.95rem;\">a.n. ${gift.holder || '-'}<\/div>\n              <div style=\"color:#2563eb;font-size:1.05rem;word-break:break-all;display:flex;align-items:center;gap:4px;\">${gift.account || '-'}${copyBtn}<\/div>\n            <\/div>\n          <\/div>`;
          }).join('');
          html = html.replace(/{{\\s*weddingGifts\\s*}}/g, gifts);
        } else {
          html = html.replace(/<section[^>]*id=["']wedding-gift-section["'][^>]*>[\s\S]*?<\/section>/gi, '');
          html = html.replace(/{{\\s*weddingGifts\\s*}}/g, '');
        }
        const copyScript = `<script>(function(){\n          document.addEventListener('click',function(e){\n            const btn = e.target.closest('.btn-copy-account');\n            if(btn){\n              const acc = btn.getAttribute('data-account');\n              if(acc){\n                navigator.clipboard.writeText(acc).then(()=>{\n                  const span = btn.querySelector('span');\n                  if(span){\n                    span.textContent='Disalin!';\n                    setTimeout(()=>{span.textContent='Salin';},1200);\n                  }\n                });\n              }\n            }\n          });\n        })();<\/script>`;
        finalHtml = `<!DOCTYPE html>\n<html lang=\"id\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>\n  <title>Undangan</title>\n  <link href=\"https://fonts.googleapis.com/css2?family=Great+Vibes&family=Poppins:wght@300;400;600&display=swap\" rel=\"stylesheet\">\n  <style>${template.css || ''}</style>\n</head>\n<body>\n${html}\n<script type=\"text/javascript\">\n${template.js || ''}\n<\/script>\n${copyScript}\n</body>\n</html>`;
        if (audioTag) {
          finalHtml = finalHtml.replace('</body>', audioTag + '\n</body>');
        }
      }
      // Simpan HTML undangan ke Firestore (field invitationHtml)
      const processedOrder = { ...order, status: 'completed', invitationLink, processedAt: new Date().toISOString(), invitationHtml: finalHtml };
      await updateOrder(orderId, processedOrder);
      setOrders(orders => orders.map(o => o.id === orderId ? processedOrder : o));
      toast({ title: 'Pesanan Diproses', description: `Link undangan: ${invitationLink}` });
    } catch (err) {
      toast({ title: 'Gagal memproses pesanan', description: err.message || String(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Edit order: update di Firestore
  const handleEditSave = async () => {
    setLoading(true);
    try {
      // Update data order di Firestore
      const order = orders.find(o => o.id === editOrder);
      let updatedOrder = { ...editData };

      // Jika pesanan sudah diproses (punya invitationLink), regenerate invitationHtml dan update Firestore
      if (order && order.invitationLink) {
        const template = templates.find(t => t.id === editData.templateId);
        if (template) {
          let html = template.html || '';
          Object.entries(editData).forEach(([key, value]) => {
            if (key === 'weddingGifts' || key === 'musicUrl') return;
            if (typeof value === 'object' && value !== null) return;
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            html = html.replace(regex, value ?? '');
          });
          // Ambil url musik dari state musicList (Firestore)
          let musicUrl = '';
          if (editData.selectedMusic && Array.isArray(musicList)) {
            const found = musicList.find(m => m.id === editData.selectedMusic);
            if (found && found.url) musicUrl = found.url;
          }
          html = html.replace(/{{\s*musicUrl\s*}}/g, musicUrl);

          // --- Inject Audio Tag + Sticky Play/Pause Button ---
          let audioTag = '';
          if (musicUrl) {
            audioTag = `\n<audio id="wedding-music" src="${musicUrl}" style="display:none" preload="auto" loop></audio>\n<button id="music-toggle-btn" style="position:fixed;right:24px;bottom:24px;width:56px;height:56px;border-radius:50%;background:#8b5cf6;box-shadow:0 2px 8px #0002;display:flex;align-items:center;justify-content:center;z-index:9999;border:none;cursor:pointer;outline:none;">\n  <svg id="music-play-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21 5,3"/></svg>\n  <svg id="music-pause-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24" style="display:none;"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>\n</button>\n<script>(function(){\n  var audio = document.getElementById('wedding-music');\n  var toggleBtn = document.getElementById('music-toggle-btn');\n  var playIcon = document.getElementById('music-play-icon');\n  var pauseIcon = document.getElementById('music-pause-icon');\n  var isPlaying = false;\n  function updateBtn() {\n    if(isPlaying) { playIcon.style.display = 'none'; pauseIcon.style.display = ''; }\n    else { playIcon.style.display = ''; pauseIcon.style.display = 'none'; }\n  }\n  function playMusic() { if(audio && audio.src) { audio.play(); isPlaying = true; updateBtn(); } }\n  function pauseMusic() { if(audio) { audio.pause(); isPlaying = false; updateBtn(); } }\n  toggleBtn.onclick = function() { if(isPlaying) { pauseMusic(); } else { playMusic(); } };\n  if(audio) {\n    audio.addEventListener('play', function(){ isPlaying = true; updateBtn(); });\n    audio.addEventListener('pause', function(){ isPlaying = false; updateBtn(); });\n    audio.addEventListener('ended', function(){ isPlaying = false; updateBtn(); });\n  }\n  document.body.addEventListener('click', function playMusicOnce(){\n    if(audio && !isPlaying) { playMusic(); }\n    document.body.removeEventListener('click', playMusicOnce);\n  });\n  document.addEventListener('visibilitychange', function(){\n    if(document.hidden && audio && !audio.paused) { pauseMusic(); }\n  });\n  updateBtn();\n})();<\/script>`;
          }

          // Handle weddingGifts: array or string
          let weddingGiftsArr = editData.weddingGifts;
          if (typeof weddingGiftsArr === 'string') {
            try {
              weddingGiftsArr = JSON.parse(weddingGiftsArr);
              if (!Array.isArray(weddingGiftsArr)) weddingGiftsArr = [];
            } catch {
              weddingGiftsArr = [];
            }
          }
          // Only show section if there is at least one valid gift
          const validGifts = (weddingGiftsArr || []).filter(gift => (gift && typeof gift === 'object' && (gift.name || gift.account || gift.holder)));
          if (validGifts.length > 0) {
            const gifts = validGifts.map((gift, idx, arr) => {
              const isEwallet = gift.type === 'ewallet';
              const icon = isEwallet
                ? '<svg width="20" height="20" fill="none" stroke="#06b6d4" stroke-width="2" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:8px;"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M16 11h2a1 1 0 0 1 0 2h-2z"/></svg>'
                : '<svg width="20" height="20" fill="none" stroke="#4f46e5" stroke-width="2" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:8px;"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 11h4a1 1 0 0 1 0 2H6z"/></svg>';
              const copyBtn = gift.account ? `<button type=\"button\" class=\"btn-copy-account\" data-account=\"${gift.account}\" style=\"margin-left:8px;padding:2px 10px;font-size:0.95rem;border:none;background:#f1f5f9;color:#2563eb;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:background .2s;\"><svg width=16 height=16 fill=none stroke='\#2563eb' stroke-width=2 viewBox='0 0 24 24'><rect x='9' y='9' width='13' height='13' rx='2'/><path d='M5 15V5a2 2 0 0 1 2-2h10'/></svg> <span>Salin</span></button>` : '';
              return `<div class=\"gift-item\" style=\"display:flex;align-items:flex-start;padding:16px 0;${idx<arr.length-1?'border-bottom:1px solid #e5e7eb;':''}\">\n            <div style=\"margin-right:12px;\">${icon}</div>\n            <div style=\"flex:1;min-width:0;\">\n              <div style=\"font-weight:600;font-size:1rem;color:#111827;\">${isEwallet ? 'E-Wallet' : 'Bank'}: ${gift.name || '-'}<\/div>\n              <div style=\"color:#374151;font-size:0.95rem;\">a.n. ${gift.holder || '-'}<\/div>\n              <div style=\"color:#2563eb;font-size:1.05rem;word-break:break-all;display:flex;align-items:center;gap:4px;\">${gift.account || '-'}${copyBtn}<\/div>\n            <\/div>\n          <\/div>`;
            }).join('');
            html = html.replace(/{{\s*weddingGifts\s*}}/g, gifts);
          } else {
            // Hapus section wedding gift jika tidak ada gift (id spesifik)
            html = html.replace(/<section[^>]*id=["']wedding-gift-section["'][^>]*>[\s\S]*?<\/section>/gi, '');
            // Jika masih ada {{weddingGifts}}, hapus juga
            html = html.replace(/{{\s*weddingGifts\s*}}/g, '');
          }
          // Tambahkan script event delegation untuk tombol copy rekening/ewallet saja (tanpa autoplay musik)
          const copyScript = `<script>(function(){\n  document.addEventListener('click',function(e){\n    const btn = e.target.closest('.btn-copy-account');\n    if(btn){\n      const acc = btn.getAttribute('data-account');\n      if(acc){\n        navigator.clipboard.writeText(acc).then(()=>{\n          const span = btn.querySelector('span');\n          if(span){\n            span.textContent='Disalin!';\n            setTimeout(()=>{span.textContent='Salin';},1200);\n          }\n        });\n      }\n    }\n  });\n})();<\/script>`;
          let finalHtml = `<!DOCTYPE html>\n<html lang=\"id\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>\n  <title>Undangan</title>\n  <link href=\"https://fonts.googleapis.com/css2?family=Great+Vibes&family=Poppins:wght@300;400;600&display=swap\" rel=\"stylesheet\">\n  <style>${template.css || ''}</style>\n</head>\n<body>\n${html}\n<script type=\"text/javascript\">\n${template.js || ''}\n<\/script>\n${copyScript}\n</body>\n</html>`;
          if (audioTag) {
            finalHtml = finalHtml.replace('</body>', audioTag + '\n</body>');
          }
          updatedOrder = {
            ...editData,
            invitationHtml: finalHtml,
            invitationLink: order.invitationLink, // pastikan link tidak berubah
          };
        }
      }

      await updateOrder(editOrder, updatedOrder);
      setOrders(orders => orders.map(o => o.id === editOrder ? { ...updatedOrder } : o));
      setEditOrder(null);
      toast({ title: 'Pesanan Diperbarui', description: 'Data pesanan & undangan berhasil diupdate.' });
    } catch (err) {
      toast({ title: 'Gagal update pesanan', description: err.message || String(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };


  // State for edit dialog
  const [editOrder, setEditOrder] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEditClick = (order) => {
    setEditOrder(order.id);
    setEditData({
      ...order,
      groomFatherName: order.groomFatherName || '',
      groomMotherName: order.groomMotherName || '',
      brideFatherName: order.brideFatherName || '',
      brideMotherName: order.brideMotherName || '',
    });
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // Filter & Search state
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  // Urutkan orders dari yang terbaru (createdAt paling baru) ke paling lama
  const sortedOrders = [...orders].sort((a, b) => {
    // createdAt bisa null/string kosong, fallback ke id jika perlu
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
  const filteredOrders = sortedOrders.filter(order => {
    if (filter === 'pending') return order.status === 'pending';
    if (filter === 'processed') return order.status === 'processing' || order.status === 'completed';
    return true;
  });
  const searchedOrders = filteredOrders.filter(order => {
    if (!search) return true;
    const template = templates.find(t => t.id === order.templateId);
    const searchText = search.toLowerCase();
    return (
      order.groomName?.toLowerCase().includes(searchText) ||
      order.brideName?.toLowerCase().includes(searchText) ||
      order.groomNickname?.toLowerCase().includes(searchText) ||
      order.brideNickname?.toLowerCase().includes(searchText) ||
      template?.name?.toLowerCase().includes(searchText) ||
      order.status?.toLowerCase().includes(searchText)
    );
  });

  // Tampilkan loading spinner jika loading
  if (loading) return <div className="py-12 text-center text-lg text-gray-500">Memuat data pesanan...</div>;

  return (
    <div>
      {/* Judul halaman tanpa badge */}
      <div className="flex items-center mb-6">
        <h1 className="text-2xl font-bold mr-2">Kelola Pesanan</h1>
      </div>
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
        <div className="flex gap-2">
          <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>
            Pesanan Terbaru
          </Button>
          <Button variant={filter === 'processed' ? 'default' : 'outline'} onClick={() => setFilter('processed')}>
            Pesanan Diproses
          </Button>
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
            Semua Pesanan
          </Button>
        </div>
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Cari nama, template, status..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full md:w-64"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border rounded-lg bg-white dark:bg-gray-900 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left">
              <th className="py-2 px-3 font-semibold">Pasangan</th>
              <th className="py-2 px-3 font-semibold">Template</th>
              <th className="py-2 px-3 font-semibold">Tanggal</th>
              <th className="py-2 px-3 font-semibold">Harga</th>
              <th className="py-2 px-3 font-semibold">Status</th>
              <th className="py-2 px-3 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {searchedOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400 dark:text-gray-500">Belum ada pesanan</td>
              </tr>
            )}
            {searchedOrders.map((order) => {
              const template = templates.find(t => t.id === order.templateId);
              return (
                <tr key={order.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-2 px-3 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
                    {order.groomName} & {order.brideName}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap text-gray-700 dark:text-gray-200">{template?.name || '-'}</td>
                  <td className="py-2 px-3 whitespace-nowrap text-gray-700 dark:text-gray-200">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 px-3 whitespace-nowrap text-gray-700 dark:text-gray-200">
                    {template?.price
                      ? `Rp${(
                          template.discount && template.discount > 0 && template.discount < 100
                            ? Math.round(template.price * (1 - template.discount / 100))
                            : template.price
                        ).toLocaleString('id-ID')}`
                      : '-'}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold 
                      ${order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'}
                    `}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {order.invitationLink && (
                      <a
                        href={order.invitationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 mr-1"
                      >
                        Lihat
                      </a>
                    )}
                    {order.status === 'pending' && (
                      <Button 
                        onClick={() => handleProcess(order.id)}
                        size="sm"
                        className="bg-blue-500 text-white hover:bg-blue-600 mr-1"
                      >
                        Proses
                      </Button>
                    )}
                    {/* Tombol Edit muncul di semua tab */}
                    <Dialog open={editOrder === order.id} onOpenChange={open => { if (!open) setEditOrder(null); }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="mr-1" onClick={() => handleEditClick(order)}>Edit</Button>
                      </DialogTrigger>
                      <DialogContent className="max-h-[90vh] overflow-y-auto w-full max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Pesanan</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
                          <div className="grid grid-cols-1 gap-2">
                            <Label>Nama Mempelai Pria</Label>
                            <Input value={editData.groomName || ''} onChange={e => handleEditChange('groomName', e.target.value)} required />
                            <Label>Nama Panggilan Pria</Label>
                            <Input value={editData.groomNickname || ''} onChange={e => handleEditChange('groomNickname', e.target.value)} required />
                            <Label>Nama Mempelai Wanita</Label>
                            <Input value={editData.brideName || ''} onChange={e => handleEditChange('brideName', e.target.value)} required />
                            <Label>Nama Panggilan Wanita</Label>
                            <Input value={editData.brideNickname || ''} onChange={e => handleEditChange('brideNickname', e.target.value)} required />
                          <Label>Nama Ayah Pria</Label>
                          <Input value={editData.groomFatherName || ''} onChange={e => handleEditChange('groomFatherName', e.target.value)} />
                          <Label>Nama Ibu Pria</Label>
                          <Input value={editData.groomMotherName || ''} onChange={e => handleEditChange('groomMotherName', e.target.value)} />
                          <Label>Nama Ayah Wanita</Label>
                          <Input value={editData.brideFatherName || ''} onChange={e => handleEditChange('brideFatherName', e.target.value)} />
                          <Label>Nama Ibu Wanita</Label>
                          <Input value={editData.brideMotherName || ''} onChange={e => handleEditChange('brideMotherName', e.target.value)} />
                          <Label>Tanggal Akad</Label>
                          <Input type="date" value={editData.akadDate ? editData.akadDate.slice(0,10) : ''} onChange={e => handleEditChange('akadDate', e.target.value)} required />
                          <Label>Jam Akad</Label>
                          <div className="flex gap-2">
                            <Input type="time" value={editData.akadTime || ''} onChange={e => handleEditChange('akadTime', e.target.value)} />
                            <Select value={editData.akadTimezone || 'WIB'} onValueChange={val => handleEditChange('akadTimezone', val)}>
                              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="WIB">WIB</SelectItem>
                                <SelectItem value="WITA">WITA</SelectItem>
                                <SelectItem value="WIT">WIT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Label>Tempat Akad</Label>
                          <Input value={editData.akadVenue || ''} onChange={e => handleEditChange('akadVenue', e.target.value)} required />
                          <Label>Google Maps Akad</Label>
                          <Input type="url" value={editData.akadMapLink || ''} onChange={e => handleEditChange('akadMapLink', e.target.value)} placeholder="Link Google Maps lokasi akad" />
                          <Label>Tanggal Resepsi</Label>
                          <Input type="date" value={editData.receptionDate ? editData.receptionDate.slice(0,10) : ''} onChange={e => handleEditChange('receptionDate', e.target.value)} required />
                          <Label>Jam Resepsi</Label>
                          <div className="flex gap-2">
                            <Input type="time" value={editData.receptionTime || ''} onChange={e => handleEditChange('receptionTime', e.target.value)} />
                            <Select value={editData.receptionTimezone || 'WIB'} onValueChange={val => handleEditChange('receptionTimezone', val)}>
                              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="WIB">WIB</SelectItem>
                                <SelectItem value="WITA">WITA</SelectItem>
                                <SelectItem value="WIT">WIT</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Label>Tempat Resepsi</Label>
                          <Input value={editData.receptionVenue || ''} onChange={e => handleEditChange('receptionVenue', e.target.value)} required />
                          <Label>Google Maps Resepsi</Label>
                          <Input type="url" value={editData.receptionMapLink || ''} onChange={e => handleEditChange('receptionMapLink', e.target.value)} placeholder="Link Google Maps lokasi resepsi" />
                            <Label>Status</Label>
                            <Select value={editData.status || 'pending'} onValueChange={val => handleEditChange('status', val)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">pending</SelectItem>
                                <SelectItem value="processing">processing</SelectItem>
                                <SelectItem value="completed">completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter className="mt-4">
                            <Button type="submit">Simpan</Button>
                            <Button type="button" variant="ghost" onClick={() => setEditOrder(null)}>Batal</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={() => handleDelete(order.id)}
                      size="sm"
                      variant="destructive"
                      style={{ display: currentUser && currentUser.type === 'cs' ? 'none' : undefined }}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersContent;

// Solusi best practice multi-step order:
// 1. Simpan progress form (draft) di localStorage/sessionStorage agar data antar step tidak hilang.
// 2. Setelah user submit/selesai, simpan data ke Firestore dan hapus draft lokal.
// 3. (Opsional) Bisa juga auto-save draft ke Firestore jika ingin cloud draft.

// Contoh penggunaan draft order di localStorage
// Di komponen form multi-step (OrderForm, bukan OrdersContent):
//
// function saveOrderDraft(draft) {
//   localStorage.setItem('orderDraft', JSON.stringify(draft));
// }
//
// function loadOrderDraft() {
//   try {
//     return JSON.parse(localStorage.getItem('orderDraft')) || {};
//   } catch { return {}; }
// }
//
// function clearOrderDraft() {
//   localStorage.removeItem('orderDraft');
// }
//
// Pada setiap step, panggil saveOrderDraft(draftData) setelah user mengisi/melanjutkan step.
// Saat submit, simpan ke Firestore, lalu clearOrderDraft().