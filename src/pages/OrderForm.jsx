import { getAllUsers } from '@/lib/firestore';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Check, Copy } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import React, { useState, useEffect, Suspense, lazy } from 'react';
const StepIndicator = lazy(() => import('@/components/order/StepIndicator'));
const Step1_TemplateInfo = lazy(() => import('@/components/order/Step1_TemplateInfo'));
const Step2_CoupleData = lazy(() => import('@/components/order/Step2_CoupleData'));
const Step3_ParentsData = lazy(() => import('@/components/order/Step3_ParentsData'));
const Step4_EventDetails = lazy(() => import('@/components/order/Step4_EventDetails'));
const Step5_MusicSelection = lazy(() => import('@/components/order/Step5_MusicSelection'));
const Step6_WeddingGift = lazy(() => import('@/components/order/Step6_WeddingGift'));
const Step7_Confirmation = lazy(() => import('@/components/order/Step7_Confirmation'));
import { addOrder, getTemplateById, getPaymentInfo } from '@/lib/firestore';

const OrderForm = () => {
  // State dan handler untuk fitur copy rekening/ewallet
  const [copiedAccount, setCopiedAccount] = useState(null);
  const handleCopyAccount = (account) => {
    if (account) {
      navigator.clipboard.writeText(account).then(() => {
        setCopiedAccount(account);
        setTimeout(() => setCopiedAccount(null), 1500);
      });
    }
  };
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [template, setTemplate] = useState(null);
  const [music, setMusic] = useState([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({ banks: [], ewallets: [] });
  const [csWhatsapp, setCsWhatsapp] = useState('');
  
  const [formData, setFormData] = useState({
    templateId: templateId,
    templateName: '',
    groomName: '', groomNickname: '', brideName: '', brideNickname: '',
    groomFatherName: '', groomMotherName: '', brideFatherName: '', brideMotherName: '',
    akadDate: '', akadTime: '', akadVenue: '', receptionDate: '', receptionTime: '', receptionVenue: '',
    selectedMusic: '',
    weddingGifts: [{ type: 'bank', name: '', account: '', holder: '' }],
    createdAt: '', status: 'pending'
  });

  const steps = [
    { id: 1, title: 'Informasi Template', description: 'Template yang dipilih' },
    { id: 2, title: 'Data Mempelai', description: 'Nama lengkap dan panggilan' },
    { id: 3, title: 'Data Orang Tua', description: 'Nama ayah dan ibu' },
    { id: 4, title: 'Waktu & Lokasi', description: 'Detail acara pernikahan' },
    { id: 5, title: 'Pilihan Musik', description: 'Musik latar undangan' },
    { id: 6, title: 'Wedding Gift', description: 'Informasi cashless' },
    { id: 7, title: 'Konfirmasi', description: 'Review dan submit' }
  ];

  useEffect(() => {
    // Ambil template dari Firestore
    if (!templateId) return;
    getTemplateById(templateId)
      .then((tpl) => {
        if (tpl) {
          setTemplate(tpl);
          setFormData(prev => ({ ...prev, templateName: tpl.name }));
        } else {
          setTemplate(null);
        }
      })
      .catch(() => setTemplate(null));

    // Selalu ambil data musik terbaru dari Firestore (tidak cek localStorage)
    import('@/lib/firestore').then(mod => {
      mod.getAllMusic().then((musicList) => {
        setMusic(musicList);
      });
    });

    // Ambil info pembayaran dari Firestore
    getPaymentInfo().then(info => setPaymentInfo(info));

    // Ambil user CS dari Firestore
    getAllUsers().then(users => {
      const cs = users.find(u => u.type === 'cs' && u.whatsapp);
      setCsWhatsapp(cs ? cs.whatsapp : '');
    });
  }, [templateId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWeddingGiftChange = (index, field, value) => {
    const updatedGifts = [...formData.weddingGifts];
    updatedGifts[index] = { ...updatedGifts[index], [field]: value };
    setFormData(prev => ({ ...prev, weddingGifts: updatedGifts }));
  };

  const addWeddingGift = () => {
    setFormData(prev => ({ ...prev, weddingGifts: [...prev.weddingGifts, { type: 'bank', name: '', account: '', holder: '' }] }));
  };

  const removeWeddingGift = (index) => {
    if (formData.weddingGifts.length > 1) {
      setFormData(prev => ({ ...prev, weddingGifts: formData.weddingGifts.filter((_, i) => i !== index) }));
    }
  };

  // Validasi per step
  const isStepValid = () => {
    if (currentStep === 2) {
      // Data mempelai wajib
      return (
        formData.groomName.trim() &&
        formData.groomNickname.trim() &&
        formData.brideName.trim() &&
        formData.brideNickname.trim()
      );
    }
    if (currentStep === 3) {
      // Data orang tua wajib
      return (
        formData.groomFatherName.trim() &&
        formData.groomMotherName.trim() &&
        formData.brideFatherName.trim() &&
        formData.brideMotherName.trim()
      );
    }
    if (currentStep === 4) {
      // Waktu, lokasi, dan link Google Maps wajib
      return (
        formData.akadDate.trim() &&
        formData.akadTime.trim() &&
        formData.akadVenue.trim() &&
        formData.akadMapLink && formData.akadMapLink.trim() &&
        formData.receptionDate.trim() &&
        formData.receptionTime.trim() &&
        formData.receptionVenue.trim() &&
        formData.receptionMapLink && formData.receptionMapLink.trim()
      );
    }
    // Step lain: tidak perlu validasi wajib
    return true;
  };

  const nextStep = () => {
    if (!isStepValid()) return;
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));


  // Fungsi generate HTML undangan dari template builder dan data pesanan
  function generateInvitationHTML(orderData, template, musicList) {
    // DEBUGGING: Log parameter masuk
    console.log('DEBUG generateInvitationHTML - musicList:', musicList);
    console.log('DEBUG generateInvitationHTML - selectedMusic:', orderData.selectedMusic);
    if (!template) return '<div>Template tidak ditemukan</div>';
    let html = template.html || '';
    // Cari url musik dari pilihan user
    let musicUrl = '';
    let selected = null;
    if (orderData.selectedMusic && Array.isArray(musicList)) {
      selected = musicList.find(m => m.id === orderData.selectedMusic);
      console.log('DEBUG generateInvitationHTML - selected music object:', selected);
      if (selected && selected.url) {
        musicUrl = selected.url;
        console.log('DEBUG generateInvitationHTML - musicUrl:', musicUrl);
      } else {
        console.warn('DEBUG generateInvitationHTML - Tidak ditemukan url musik untuk id:', orderData.selectedMusic);
      }
    } else {
      console.warn('DEBUG generateInvitationHTML - musicList kosong atau selectedMusic tidak ada');
    }
    // Replace semua {{musicUrl}} di template (untuk backward compatibility)
    html = html.replace(/{{\s*musicUrl\s*}}/g, musicUrl);
    Object.entries(orderData).forEach(([key, value]) => {
      if (key === 'weddingGifts') return;
      if (typeof value === 'object' && value !== null) return;
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      html = html.replace(regex, value ?? '');
    });
    if (html.includes('{{weddingGifts}}')) {
      let weddingGiftsArr = orderData.weddingGifts;
      if (typeof weddingGiftsArr === 'string') {
        try {
          weddingGiftsArr = JSON.parse(weddingGiftsArr);
          if (!Array.isArray(weddingGiftsArr)) weddingGiftsArr = [];
        } catch {
          weddingGiftsArr = [];
        }
      }
      const gifts = (weddingGiftsArr || [])
        .filter(gift => (gift && typeof gift === 'object' && (gift.name || gift.account || gift.holder)))
        .map((gift, idx, arr) => {
          const isEwallet = gift.type === 'ewallet';
          const icon = isEwallet
            ? '<svg width="20" height="20" fill="none" stroke="#06b6d4" stroke-width="2" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:8px;"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M16 11h2a1 1 0 0 1 0 2h-2z"/></svg>'
            : '<svg width="20" height="20" fill="none" stroke="#4f46e5" stroke-width="2" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:8px;"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 11h4a1 1 0 0 1 0 2H6z"/></svg>';
          const copyBtn = gift.account ? `<button type=\"button\" class=\"btn-copy-account\" data-account=\"${gift.account}\" style=\"margin-left:8px;padding:2px 10px;font-size:0.95rem;border:none;background:#f1f5f9;color:#2563eb;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;transition:background .2s;\"><svg width=16 height=16 fill=none stroke=\'#2563eb\' stroke-width=2 viewBox=\'0 0 24 24\'><rect x=\'9\' y=\'9\' width=\'13\' height=\'13\' rx=\'2\'/><path d=\'M5 15V5a2 2 0 0 1 2-2h10\'/></svg> <span>Salin</span></button>` : '';
          return `<div class=\"gift-item\" style=\"display:flex;align-items:flex-start;padding:16px 0;${idx<arr.length-1?'border-bottom:1px solid #e5e7eb;':''}\">\n            <div style=\"margin-right:12px;\">${icon}</div>\n            <div style=\"flex:1;min-width:0;\">\n              <div style=\"font-weight:600;font-size:1rem;color:#111827;\">${isEwallet ? 'E-Wallet' : 'Bank'}: ${gift.name || '-'}<\/div>\n              <div style=\"color:#374151;font-size:0.95rem;\">a.n. ${gift.holder || '-'}<\/div>\n              <div style=\"color:#2563eb;font-size:1.05rem;word-break:break-all;display:flex;align-items:center;gap:4px;\">${gift.account || '-'}${copyBtn}<\/div>\n            <\/div>\n          <\/div>`;
        })
        .join('');
      html = html.replace(/{{\s*weddingGifts\s*}}/g, gifts || '');
    }
    // Sisipkan audio player otomatis jika ada musik latar
    let audioTag = '';
    if (musicUrl) {
      audioTag = `<audio id="wedding-music" src="${musicUrl}" style="display:none" preload="auto" loop></audio>\n<script>(function(){\n  var audio = document.getElementById('wedding-music');\n  if(audio){\n    document.body.addEventListener('click', function playMusicOnce(){\n      audio.play();\n      document.body.removeEventListener('click', playMusicOnce);\n    });\n  }\n})();<\/script>`;
    }
    const copyScript = `<script>(function(){
      document.addEventListener('click',function(e){
        const btn = e.target.closest('.btn-copy-account');
        if(btn){
          const acc = btn.getAttribute('data-account');
          if(acc){
            navigator.clipboard.writeText(acc).then(()=>{
              const span = btn.querySelector('span');
              if(span){
                const old = span.textContent;
                span.textContent = 'Berhasil disalin!';
                btn.style.background = '#bbf7d0';
                btn.style.color = '#15803d';
                setTimeout(()=>{
                  span.textContent = old;
                  btn.style.background = '#f1f5f9';
                  btn.style.color = '#2563eb';
                },1200);
              }
            });
          }
        }
      });
    })();</script>`;
    // Sisipkan audioTag sebelum </body> jika ada
    let finalHtml = `<!DOCTYPE html>\n<html lang=\"id\">\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>\n  <title>Undangan</title>\n  <link href=\"https://fonts.googleapis.com/css2?family=Great+Vibes&family=Poppins:wght@300;400;600&display=swap\" rel=\"stylesheet\">\n  <style>${template.css || ''}</style>\n</head>\n<body>\n${html}\n<script type=\"text/javascript\">\n${template.js || ''}\n</script>\n${copyScript}\n</body>\n</html>`;
    if (audioTag) {
      finalHtml = finalHtml.replace('</body>', audioTag + '\n</body>');
    }
    // DEBUGGING: Log hasil final HTML
    console.log('DEBUG generateInvitationHTML - finalHtml:', finalHtml);
    return finalHtml;
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const orderData = { ...formData, createdAt: new Date().toISOString() };
    try {
      // Simpan order ke Firestore, dapatkan docRef.id sebagai ID order
      const saved = await addOrder(orderData);
      const firestoreId = saved.id;
      // Hapus draft order lokal
      localStorage.removeItem('orderDraft');
      // Generate undangan HTML dan simpan ke localStorage (untuk preview/admin)
      const html = generateInvitationHTML({ ...orderData, id: firestoreId }, template, music);
      localStorage.setItem('inv-' + firestoreId, html);
      // Tampilkan dialog sukses dan link undangan
      setInvitationLink(`${window.location.origin}/invitation/${firestoreId}`);
      setShowSuccessDialog(true);
    } catch (err) {
      alert('Gagal menyimpan pesanan: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const [invitationLink, setInvitationLink] = useState('');

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <Step1_TemplateInfo template={template} />;
      case 2: return <Step2_CoupleData formData={formData} handleInputChange={handleInputChange} />;
      case 3: return <Step3_ParentsData formData={formData} handleInputChange={handleInputChange} />;
      case 4: return <Step4_EventDetails formData={formData} handleInputChange={handleInputChange} />;
      case 5: return <Step5_MusicSelection formData={formData} handleInputChange={handleInputChange} music={music} />;
      case 6: return <Step6_WeddingGift formData={formData} handleWeddingGiftChange={handleWeddingGiftChange} addWeddingGift={addWeddingGift} removeWeddingGift={removeWeddingGift} />;
      case 7: return <Step7_Confirmation formData={formData} music={music} />;
      default: return null;
    }
  };

  const [copied, setCopied] = useState(false);
  const handleCopyWhatsapp = () => {
    if (csWhatsapp) {
      navigator.clipboard.writeText(csWhatsapp).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  };

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center justify-center w-full max-w-md bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg p-6 md:p-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="mb-4"
          >
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="24" stroke="#a78bfa" strokeWidth="6" opacity="0.2" />
              <path d="M52 28c0-13.255-10.745-24-24-24" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-purple-500 text-lg font-semibold text-center"
          >
            Memuat form pesanan...
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1.2, duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
            className="text-gray-400 mt-2 text-center text-base md:text-lg"
          >
            Mohon tunggu sebentar, kami sedang menyiapkan tampilan terbaik untuk Anda.
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Form Pemesanan - {template.name} | UndanganKami</title>
        <meta name="description" content={`Pesan template undangan digital ${template.name}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative">
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-purple-100 dark:border-gray-800 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Logo size={44} className="h-11 w-auto" />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate('/')} className="border-purple-200 dark:border-gray-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-800">Kembali</Button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <Suspense fallback={<div className="text-center py-12">Memuat form...</div>}>
            <StepIndicator steps={steps} currentStep={currentStep} />
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="max-w-2xl mx-auto">
                <CardContent className="p-8">
                  {renderStepContent()}
                </CardContent>
              </Card>
            </motion.div>
            <div className="flex justify-between mt-8 max-w-2xl mx-auto">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Sebelumnya
              </Button>
              {currentStep < steps.length ? (
                <Button 
                  onClick={nextStep} 
                  className="gradient-bg text-white"
                  disabled={!isStepValid()}
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="gradient-bg text-white flex items-center justify-center" disabled={isSubmitting}>
                  {isSubmitting && (
                    <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  )}
                  {isSubmitting ? 'Mengirim Pesanan...' : 'Pesan Sekarang'}
                </Button>
              )}
            </div>
          </Suspense>
        </div>

        <Dialog open={showSuccessDialog} onOpenChange={() => navigate('/')}> 
          <DialogContent className="max-w-lg w-full text-center p-0 overflow-hidden">
            <DialogHeader className="bg-green-50 dark:bg-green-900/40 px-6 pt-6 pb-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-2">
                <Check className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <DialogTitle className="text-2xl w-full text-center font-bold text-green-700 mb-1">Pesanan Berhasil!</DialogTitle>
            </DialogHeader>
            <div className="px-6 pt-2 pb-1">
              <span className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-0.5">Jumlah yang harus dibayarkan:</span>
              <span className="block text-2xl font-extrabold text-purple-700 mb-1">
                {template && template.price ?
                  template.discount && Number(template.discount) > 0
                    ? `Rp${(Number(template.price) * (1 - Number(template.discount)/100)).toLocaleString('id-ID')}`
                    : `Rp${Number(template.price).toLocaleString('id-ID')}`
                  : '-'}
              </span>
              {template && template.discount && Number(template.discount) > 0 && (
                <span className="block text-xs text-gray-500">(Sudah termasuk diskon {template.discount}%)</span>
              )}
            </div>
            <div className="px-6 pb-1">
              <p className="text-gray-600 text-xs mb-2">Pilih salah satu metode pembayaran di bawah ini lalu lakukan pembayaran:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* List rekening bank */}
                {paymentInfo.banks && paymentInfo.banks.length > 0 && (
                  <div className="col-span-1">
                    <div className="font-semibold text-xs mb-1 text-purple-700">Rekening Bank</div>
                    <div className="flex flex-col gap-1">
                      {paymentInfo.banks.map(bank => (
                        <div key={bank.id} className="text-xs border border-purple-200 rounded px-2 py-1 bg-purple-50 dark:bg-gray-800 flex flex-col gap-0.5">
                          <div className="font-bold text-sm text-purple-800">{bank.name}</div>
                          <div className="text-[0.95em] text-gray-700 dark:text-gray-200">a.n. {bank.holder}</div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base text-purple-700 tracking-wide">{bank.account}</span>
                            <button
                              type="button"
                              className={`ml-1 px-2 py-0.5 rounded text-xs border ${copiedAccount === bank.account ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-100'} transition`}
                              onClick={() => handleCopyAccount(bank.account)}
                              aria-label="Salin nomor rekening"
                            >
                              {copiedAccount === bank.account ? 'Disalin!' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* List e-wallet */}
                {paymentInfo.ewallets && paymentInfo.ewallets.length > 0 && (
                  <div className="col-span-1">
                    <div className="font-semibold text-xs mb-1 text-cyan-700">E-wallet</div>
                    <div className="flex flex-col gap-1">
                      {paymentInfo.ewallets.map(ew => (
                        <div key={ew.id} className="text-xs border border-cyan-200 rounded px-2 py-1 bg-cyan-50 dark:bg-gray-800 flex flex-col gap-0.5">
                          <div className="font-bold text-sm text-cyan-800">{ew.name}</div>
                          <div className="text-[0.95em] text-gray-700 dark:text-gray-200">a.n. {ew.holder}</div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-base text-cyan-700 tracking-wide">{ew.account}</span>
                            <button
                              type="button"
                              className={`ml-1 px-2 py-0.5 rounded text-xs border ${copiedAccount === ew.account ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-cyan-700 border-cyan-200 hover:bg-cyan-100'} transition`}
                              onClick={() => handleCopyAccount(ew.account)}
                              aria-label="Salin nomor e-wallet"
                            >
                              {copiedAccount === ew.account ? 'Disalin!' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 pt-1 pb-4">
              <p className="text-gray-600 text-xs mb-1 mt-2">Setelah transfer, konfirmasi pembayaran melalui tombol berikut:</p>
              {(() => {
                let amount = '-';
                if (template && template.price) {
                  amount = template.discount && Number(template.discount) > 0
                    ? `Rp${(Number(template.price) * (1 - Number(template.discount)/100)).toLocaleString('id-ID')}`
                    : `Rp${Number(template.price).toLocaleString('id-ID')}`;
                }
                const groom = formData.groomName || '-';
                const bride = formData.brideName || '-';
                const waMsg = `Saya ingin konfirmasi pembayaran untuk pesanan atas nama ${groom} & ${bride} sejumlah ${amount}.`;
                const waUrl = csWhatsapp
                  ? `https://wa.me/${csWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMsg)}`
                  : '#';
                return (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button className="w-full bg-green-500 hover:bg-green-600 text-white text-base font-bold py-2 rounded shadow-sm mt-1">Konfirmasi via WhatsApp</Button>
                  </a>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
        {/* ThemeToggle dipindahkan ke header kanan */}
      </div>
    </>
  );
};

export default OrderForm;