
import React, { useState, useEffect } from 'react';
import { getTemplateById } from '@/lib/firestore';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Calendar, MapPin, Gift, Music, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const TemplatePreview = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!templateId) return;
    setLoading(true);
    getTemplateById(templateId)
      .then((tpl) => {
        setTemplate(tpl);
        setLoading(false);
      })
      .catch(() => {
        setTemplate(null);
        setLoading(false);
      });
  }, [templateId]);

  // Sample data for preview
  const sampleData = {
    groomName: 'Ahmad Yusuf',
    groomNickname: 'Yusuf',
    brideName: 'Siti Aisyah',
    brideNickname: 'Aisyah',
    groomFather: 'Bapak Abdullah',
    groomMother: 'Ibu Khadijah',
    brideFather: 'Bapak Muhammad',
    brideMother: 'Ibu Fatimah',
    akadDate: '2024-12-15',
    akadTime: '08:00',
    akadVenue: 'Masjid Al-Ikhlas, Jl. Merdeka No. 123, Jakarta Pusat',
    receptionDate: '2024-12-15',
    receptionTime: '11:00',
    receptionVenue: 'Gedung Serbaguna Al-Hikmah, Jl. Sudirman No. 456, Jakarta Pusat',
    weddingDate: new Date('2024-12-15')
  };

  // Countdown calculation
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const weddingTime = sampleData.weddingDate.getTime();
      const difference = weddingTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  if (loading) {
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
            Memuat preview template...
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1.2, duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
            className="text-gray-400 mt-2 text-center text-base md:text-lg"
          >
            Mohon tunggu sebentar, kami sedang menyiapkan tampilan undangan terbaik untuk Anda.
          </motion.p>
        </div>
      </div>
    );
  }
  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Template tidak ditemukan</p>
      </div>
    );
  }

  // Jika template punya html/css/js, render live preview
  if (template.html || template.css || template.js) {
    const srcDoc = `<!DOCTYPE html><html><head><style>${template.css || ''}</style></head><body>${template.html || ''}<script>${template.js || ''}<\/script></body></html>`;
    return (
      <>
        <Helmet>
          <title>Preview {template.name} - UndanganKami</title>
          <meta name="description" content={`Preview template undangan digital ${template.name}`} />
        </Helmet>
        {/* Tombol Kembali dan Pesan Template Ini, floating di atas undangan, hanya icon */}
        <div style={{position:'fixed',top:24,left:24,zIndex:100}}>
          <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>
        <div style={{position:'fixed',top:24,right:24,zIndex:100}}>
          <Button onClick={() => navigate(`/order/${templateId}`)} className="gradient-bg text-white flex items-center gap-2 p-2">
            <Gift className="h-6 w-6" />
            <span className="font-medium">Pesan template ini</span>
          </Button>
        </div>
        {/* Iframe undangan full screen */}
        <iframe
          title={`Preview ${template.name}`}
          srcDoc={srcDoc}
          sandbox="allow-scripts allow-same-origin"
          style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',border:'none',zIndex:50,background:'#fff'}}
        />
        {/* Theme Toggle dihilangkan pada preview mode */}
      </>
    );
  }

  // Fallback: tampilan statis lama
  return (
    <>
      <Helmet>
        <title>Preview {template.name} - UndanganKami</title>
        <meta name="description" content={`Preview template undangan digital ${template.name}`} />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 relative">
        <p className="text-gray-700 dark:text-gray-200">Template tidak memiliki desain khusus.</p>
        {/* Sticky Theme Toggle Bottom Right */}
        <div className="fixed right-6 bottom-6 z-50">
          <ThemeToggle />
        </div>
      </div>
    </>
  );
};

export default TemplatePreview;
