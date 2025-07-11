import React, { useState, useEffect } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Save } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { getAllTemplates, addTemplate, updateTemplate, deleteTemplate, getTemplateById } from '@/lib/firestore';

// TemplateBuilder: editor HTML/CSS/JS live preview
const TemplateBuilder = () => {
  // Untuk upload thumbnail hanya saat simpan
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const navigate = useNavigate();
  const { templateId } = useParams();
  const { toast } = useToast();
  // State
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [category, setCategory] = useState('Classic');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [thumbnail, setThumbnail] = useState(''); // Cloudinary URL
  const [srcDoc, setSrcDoc] = useState('');
  const [activeTab, setActiveTab] = useState('html');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewFull, setPreviewFull] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  // Untuk konfirmasi keluar jika ada perubahan
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [initialData, setInitialData] = useState(null);
  // Untuk animasi simpan utama
  const [isSaving, setIsSaving] = useState(false);

  // Load template dari Firestore (edit mode) atau kosong (new)
  useEffect(() => {
    if (templateId) {
      getTemplateById(templateId).then(found => {
        if (found) {
          setTemplateName(found.name || '');
          setTemplateDescription(found.description || '');
          setCategory(found.category || 'Classic');
          setPrice(found.price !== undefined ? found.price : '');
          setDiscount(found.discount !== undefined ? found.discount : '');
          setHtml(found.html || '');
          setCss(found.css || '');
          setJs(found.js || '');
          setThumbnail(found.thumbnail || '');
          setShowInfoModal(false);
          setInitialData({
            name: found.name || '',
            description: found.description || '',
            category: found.category || 'Classic',
            price: found.price !== undefined ? found.price : '',
            discount: found.discount !== undefined ? found.discount : '',
            html: found.html || '',
            css: found.css || '',
            js: found.js || '',
            thumbnail: found.thumbnail || ''
          });
        }
      });
    } else {
      setTemplateName('');
      setTemplateDescription('');
      setHtml('');
      setCss('');
      setJs('');
      setThumbnail('');
      setShowInfoModal(true);
      setInitialData({
        name: '',
        description: '',
        category: 'Classic',
        price: '',
        discount: '',
        html: '',
        css: '',
        js: '',
        thumbnail: ''
      });
    }
    // eslint-disable-next-line
  }, [templateId]);

  // Live preview update
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`<!DOCTYPE html><html lang="id"><head><meta charset='UTF-8'/><meta name='viewport' content='width=device-width, initial-scale=1.0'/>\n<link href='https://fonts.googleapis.com/css2?family=Great+Vibes&family=Poppins:wght@300;400;600&display=swap' rel='stylesheet'>\n<style>${css}</style></head><body>${html}<script>${js}\n<\/script></body></html>`);
    }, 300);
    return () => clearTimeout(timeout);
  }, [html, css, js]);

  // Tidak lagi auto-save ke localStorage agar selalu kosong saat dibuka

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    let finalThumbnail = thumbnail;
    if (thumbnailFile) {
      // Jika masih ada thumbnail lama (Cloudinary), blok upload baru
      if (thumbnail && typeof thumbnail === 'string' && thumbnail.startsWith('http')) {
        toast({ title: 'Hapus gambar lama dulu sebelum upload gambar baru.', variant: 'destructive' });
        setIsSaving(false);
        return;
      }
      // Upload file baru ke Cloudinary
      try {
        const formData = new FormData();
        formData.append('file', thumbnailFile);
        formData.append('upload_preset', 'unsigned_preset');
        const res = await fetch('https://api.cloudinary.com/v1_1/dkfue0nxr/image/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.secure_url) {
          finalThumbnail = data.secure_url;
        } else {
          toast({ title: 'Gagal upload thumbnail', description: data.error?.message || '', variant: 'destructive' });
          setIsSaving(false);
          return;
        }
      } catch (err) {
        toast({ title: 'Gagal upload thumbnail', description: err.message, variant: 'destructive' });
        setIsSaving(false);
        return;
      }
    }
    if (!templateName) {
      toast({ title: "Nama Template Diperlukan", variant: "destructive" });
      setIsSaving(false);
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      toast({ title: "Harga tidak valid", description: "Masukkan harga template (angka, minimal 0)", variant: "destructive" });
      setIsSaving(false);
      return;
    }
    if (discount && (isNaN(Number(discount)) || Number(discount) < 0 || Number(discount) > 100)) {
      toast({ title: "Diskon tidak valid", description: "Diskon harus 0-100 (%)", variant: "destructive" });
      setIsSaving(false);
      return;
    }
    // Ambil user login (opsional, bisa diisi manual jika belum ada auth)
    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem('adminUser')) || null;
    } catch {
      currentUser = null;
    }
    const templateData = {
      name: templateName,
      description: templateDescription,
      price,
      discount,
      status: 'draft',
      category,
      html,
      css,
      js,
      thumbnail: finalThumbnail,
      createdBy: currentUser ? currentUser.username : 'admin',
      updatedAt: new Date().toISOString(),
    };
    if (templateId) {
      // Edit mode: update Firestore
      updateTemplate(templateId, templateData)
        .then(() => {
          toast({ title: "Template Diperbarui!", description: "Perubahan template berhasil disimpan." });
          setThumbnail(templateData.thumbnail); // Pastikan state thumbnail sinkron dengan database
          setInitialData({
            name: templateData.name,
            description: templateData.description,
            category: templateData.category,
            price: templateData.price,
            discount: templateData.discount,
            html: templateData.html,
            css: templateData.css,
            js: templateData.js,
            thumbnail: templateData.thumbnail
          });
        })
        .catch((err) => {
          toast({ title: "Gagal update template", description: err.message, variant: "destructive" });
        })
        .finally(() => setIsSaving(false));
    } else {
      // New mode: add to Firestore
      addTemplate({ ...templateData, createdAt: new Date().toISOString() })
        .then((result) => {
          toast({ title: "Template Disimpan!", description: "Template Anda berhasil disimpan." });
          setShowInfoModal(false);
          setInitialData({
            name: templateData.name,
            description: templateData.description,
            category: templateData.category,
            price: templateData.price,
            discount: templateData.discount,
            html: templateData.html,
            css: templateData.css,
            js: templateData.js,
            thumbnail: templateData.thumbnail
          });
          // Redirect ke mode edit agar tidak duplikat jika simpan lagi
          if (result && result.id) {
            navigate(`/admin/template-builder/${result.id}`, { replace: true });
          }
        })
        .catch((err) => {
          toast({ title: "Gagal simpan template", description: err.message, variant: "destructive" });
        })
        .finally(() => setIsSaving(false));
    }
    // Reset file setelah simpan
    setThumbnailFile(null);
  };

  return (
    <>
      <Helmet>
        <title>Theme Builder HTML/CSS/JS - UndanganKami</title>
      </Helmet>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 relative">
        {/* Panel kiri (sidebar) dihapus sesuai permintaan */}
        {/* Editor & Preview */}
        <main className="flex-1 flex flex-col p-0 md:p-8 gap-4 overflow-y-auto">
          {/* Horizontal Info Bar */}
          {/* Info Modal Trigger, Back, & Save */}
          <div className="w-full flex items-center gap-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 rounded-t-lg shadow-sm mb-2" style={{minHeight:48}}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                className="px-3 py-1 rounded bg-purple-50 text-purple-700 font-semibold text-sm border border-purple-100 hover:bg-purple-100 transition-colors"
                onClick={() => setShowInfoModal(true)}
              >
                Info Template
              </button>
            <button
              className="px-3 py-1 rounded bg-gray-100 text-gray-700 font-semibold text-sm border border-gray-200 hover:bg-gray-200 transition-colors ml-2"
              onClick={e => {
                // Deteksi perubahan (dirty)
                const dirty = initialData && (
                  templateName !== initialData.name ||
                  templateDescription !== initialData.description ||
                  category !== initialData.category ||
                  price !== initialData.price ||
                  discount !== initialData.discount ||
                  html !== initialData.html ||
                  css !== initialData.css ||
                  js !== initialData.js ||
                  thumbnail !== initialData.thumbnail
                );
                if (dirty) {
                  setShowLeaveConfirm(true);
                } else {
                  navigate('/admin?tab=templates');
                }
              }}
              title="Kembali ke Pengelolaan Template"
            >
              ← Kembali ke Pengelolaan Template
            </button>
      {/* Popup konfirmasi keluar jika ada perubahan */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 py-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-sm border border-gray-200 dark:border-gray-700 animate-fadeIn">
            <div className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Perubahan Belum Disimpan</div>
            <div className="mb-4 text-gray-600 dark:text-gray-300">Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar tanpa menyimpan?</div>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setShowLeaveConfirm(false)} variant="outline">Batal</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => { setShowLeaveConfirm(false); navigate('/admin?tab=templates'); }}>Ya, Keluar</Button>
            </div>
          </div>
        </div>
      )}
            </div>
            <Button onClick={handleSaveTemplate} className="gradient-bg text-white flex-shrink-0" disabled={isSaving}>
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2 inline-block text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Simpan
                </>
              )}
            </Button>
          </div>
          {/* Info Modal */}
          {showInfoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2 py-8 overflow-y-auto">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-4 sm:p-8 w-full max-w-md relative animate-fadeIn border border-gray-200 dark:border-gray-700">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
                  onClick={() => setShowInfoModal(false)}
                  aria-label="Tutup"
                >
                  &times;
                </button>
                <h2 className="text-lg font-bold mb-4 text-center text-gray-800 dark:text-gray-100">Info Template</h2>
                <form className="grid gap-4">
                  <div>
                    <Label htmlFor="templateName" className="text-gray-700 dark:text-gray-200">Nama Template</Label>
                    <Input id="templateName" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Contoh: Mawar HTML" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="templateDescription" className="text-gray-700 dark:text-gray-200">Deskripsi</Label>
                    <textarea
                      id="templateDescription"
                      value={templateDescription}
                      onChange={e => setTemplateDescription(e.target.value)}
                      placeholder="Deskripsi singkat template"
                      className="w-full min-h-[60px] rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="templateCategory" className="text-gray-700 dark:text-gray-200">Kategori Template</Label>
                    <select
                      id="templateCategory"
                      className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-700 mt-1"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                    >
                      <option value="Classic">Classic</option>
                      <option value="Modern">Modern</option>
                      <option value="Minimalist">Minimalist</option>
                      <option value="Traditional">Traditional</option>
                      <option value="Elegant">Elegant</option>
                      <option value="Islamic">Islamic</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="templatePrice" className="text-gray-700 dark:text-gray-200">Harga Template (Rp)</Label>
                      <Input
                        id="templatePrice"
                        type="number"
                        min="0"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="Contoh: 150000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="templateDiscount" className="text-gray-700 dark:text-gray-200">Diskon (%)</Label>
                      <Input
                        id="templateDiscount"
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={e => setDiscount(e.target.value)}
                        placeholder="Contoh: 20"
                        className="mt-1"
                      />
                      <span className="text-xs text-gray-400 dark:text-gray-500">Isi 0 jika tidak ada diskon</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="templateThumbnail" className="text-gray-700 dark:text-gray-200">Thumbnail / Feature Image</Label>
                    {/* Tombol hapus thumbnail jika ada thumbnail lama (Cloudinary) */}
                    {thumbnail && typeof thumbnail === 'string' && thumbnail.startsWith('http') && (
                      <>
                        <img src={thumbnail} alt="Thumbnail Preview" className="mt-2 rounded w-full h-32 object-cover border border-gray-200 dark:border-gray-700" loading="lazy" />
                        <Button
                          type="button"
                          className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white"
                          onClick={async () => {
                            // Hapus thumbnail dari Cloudinary
                            try {
                              const matches = thumbnail.match(/\/v\d+\/([^\.\/]+)(?:\.[a-zA-Z0-9]+)?$/);
                              const public_id = matches ? matches[1] : null;
                              if (public_id) {
                                await fetch('http://localhost:4000/delete-music', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ public_id, resource_type: 'image' })
                                });
                                setThumbnail('');
                                setThumbnailFile(null);
                                toast({ title: 'Thumbnail berhasil dihapus.' });
                              }
                            } catch (err) {
                              toast({ title: 'Gagal hapus thumbnail', description: err?.message, variant: 'destructive' });
                            }
                          }}
                        >Hapus Thumbnail</Button>
                        <div className="text-xs text-gray-400 mt-1">Hapus gambar lama sebelum upload baru.</div>
                      </>
                    )}
                    {/* Input file hanya aktif jika tidak ada thumbnail lama */}
                    {(!thumbnail || (typeof thumbnail === 'string' && !thumbnail.startsWith('http'))) && (
                      <input
                        id="templateThumbnail"
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mt-1"
                        onChange={async (e) => {
                          const file = e.target.files && e.target.files[0];
                          if (file) {
                            setThumbnailFile(file);
                            // Preview gambar lokal sebelum upload
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setThumbnail(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    )}
                  </div>
                  <Button onClick={() => setShowInfoModal(false)} className="w-full gradient-bg text-white mt-2">Simpan</Button>
                </form>
              </div>
            </div>
          )}
          {/* Tabs */}
          <div className="flex border-b bg-gray-50 dark:bg-gray-900 rounded-t-lg px-2">
            <button onClick={() => setActiveTab('html')} className={`px-4 py-2 text-sm font-mono border-b-2 transition-colors ${activeTab==='html' ? 'border-purple-500 text-purple-700 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}>HTML</button>
            <button onClick={() => setActiveTab('css')} className={`px-4 py-2 text-sm font-mono border-b-2 transition-colors ${activeTab==='css' ? 'border-purple-500 text-purple-700 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}>CSS</button>
            <button onClick={() => setActiveTab('js')} className={`px-4 py-2 text-sm font-mono border-b-2 transition-colors ${activeTab==='js' ? 'border-purple-500 text-purple-700 bg-white' : 'border-transparent text-gray-500 hover:bg-gray-100'}`}>JS</button>
          </div>
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm min-h-[350px]">
              {/* Editor */}
              <div className="flex-1 min-h-[200px]">
                {activeTab === 'html' && (
                  <Editor
                    height="100%"
                    defaultLanguage="html"
                    value={html}
                    onChange={v => setHtml(v || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                    }}
                  />
                )}
                {activeTab === 'css' && (
                  <Editor
                    height="100%"
                    defaultLanguage="css"
                    value={css}
                    onChange={v => setCss(v || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                    }}
                  />
                )}
                {activeTab === 'js' && (
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    value={js}
                    onChange={v => setJs(v || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                    }}
                  />
                )}
              </div>
            </div>
            <div className="flex-1 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col min-h-[350px] relative">
              {/* Fullscreen Close Button */}
              {previewFull && (
                <button
                  className="fixed top-4 right-4 z-[100] px-3 py-1 rounded bg-white/90 border border-purple-200 shadow text-purple-700 text-xs font-semibold hover:bg-purple-50 transition-colors"
                  onClick={() => setPreviewFull(false)}
                  style={{boxShadow:'0 2px 8px #0002'}}
                  title="Keluar Fullscreen"
                >
                  Keluar Fullscreen ✕
                </button>
              )}
              <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-500 dark:text-gray-300 flex items-center justify-between">
                <span>Live Preview</span>
                {!previewFull && (
                  <button
                    className="ml-auto px-2 py-1 rounded hover:bg-purple-100 text-purple-700 text-xs font-semibold transition-colors"
                    onClick={() => setPreviewFull(true)}
                    title="Fullscreen Preview"
                  >
                    Fullscreen
                  </button>
                )}
              </div>
              <iframe
                title="Live Preview"
                srcDoc={srcDoc}
                sandbox="allow-scripts allow-clipboard-write"
                className="w-full flex-1 bg-white dark:bg-gray-900"
                style={previewFull ? { border: 'none', minHeight: '100vh', minWidth: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 50, background: '#111' } : { border: 'none', minHeight: 350 }}
              />
        {/* Sticky Theme Toggle Bottom Right */}
        <div className="fixed right-6 bottom-6 z-50">
          <ThemeToggle />
        </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default TemplateBuilder;