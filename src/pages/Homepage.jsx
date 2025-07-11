
import React, { useState, useEffect } from 'react';
import { getAllTemplates, subscribeTemplates } from '@/lib/firestore';
import { getSiteSettings } from '@/lib/siteSettings';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Eye, ShoppingCart, Heart, Music, Palette } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const Homepage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollToTemplatesTop = () => {
    const el = document.getElementById('templates');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const templatesPerPage = 5;

  useEffect(() => {
    setLoading(true);
    // Ambil siteSettings (logo) dari Firestore dan simpan ke localStorage
    getSiteSettings().then(settings => {
      if (settings) {
        localStorage.setItem('siteSettings', JSON.stringify(settings));
      }
    });
    // Ambil data template (tidak realtime)
    getAllTemplates().then(allTemplates => {
      const publishedTemplates = allTemplates.filter(template => template.status === 'publish');
      setTemplates(publishedTemplates);
      setLoading(false);
    });
  }, []);

  const handlePreview = (templateId) => {
    navigate(`/preview/${templateId}`);
  };

  const handleOrder = (templateId) => {
    navigate(`/order/${templateId}`);
  };

  return (
    <>
      <Helmet>
        <title>UndanganKami - Platform Undangan Digital Terbaik</title>
        <meta name="description" content="Buat undangan digital yang menawan dengan berbagai template menarik. Mudah, cepat, dan elegan untuk hari spesial Anda." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-purple-100 dark:border-gray-800 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Logo size={44} className="h-11 w-auto" />
                {/* Logo caption dihapus sesuai permintaan */}
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <nav className="hidden md:flex items-center space-x-8">
                  <a href="#templates" className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Template</a>
                  <a href="#features" className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Fitur</a>
                  {/* Opsi Kontak di header dihapus sesuai permintaan */}
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/admin/login')}
                    className="border-purple-200 dark:border-gray-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-800"
                  >
                    Admin
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 font-playfair">
                Undangan Digital
                <span className="block gradient-text">Yang Menawan</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Ciptakan undangan pernikahan digital yang elegan dan berkesan untuk hari bahagia Anda
              </p>
              <Button 
                size="lg" 
                className="gradient-bg text-white px-8 py-4 text-lg rounded-full hover:shadow-lg transition-all"
                onClick={() => document.getElementById('templates').scrollIntoView({ behavior: 'smooth' })}
              >
                Lihat Template
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 px-4 bg-white/50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 font-playfair">Fitur Unggulan</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Nikmati berbagai fitur menarik yang membuat undangan Anda semakin istimewa
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Palette className="h-12 w-12 text-purple-600" />, 
                  title: 'Template Beragam',
                  description: 'Pilihan template yang elegan dan dapat disesuaikan dengan tema pernikahan Anda'
                },
                {
                  icon: <Music className="h-12 w-12 text-purple-600" />, 
                  title: 'Musik Islami',
                  description: 'Koleksi ayat Al-Quran dan nasyid untuk menambah kekhusyukan undangan'
                },
                {
                  icon: <Heart className="h-12 w-12 text-purple-600" />, 
                  title: 'Wedding Gift Digital',
                  description: 'Fitur cashless untuk memudahkan tamu memberikan hadiah pernikahan'
                }
              ].map((feature, index) => (
                <div key={index}>
                  <Card className="text-center p-6 card-hover border-purple-100">
                    <CardContent className="pt-6">
                      <div className="mb-4 flex justify-center">{feature.icon}</div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates Section */}
        <section id="templates" className="py-16 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 font-playfair">Template Terbaru</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Pilih dari koleksi template undangan digital terbaik kami
              </p>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="text-center py-12 flex flex-col items-center justify-center">
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
                  className="text-purple-500 text-lg font-semibold"
                >
                  Memuat template...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 1.2, duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
                  className="text-gray-400 mt-2"
                >
                  Mohon tunggu sebentar, kami sedang mengambil koleksi terbaik untuk Anda.
                </motion.p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {templates
                    .slice((currentPage - 1) * templatesPerPage, currentPage * templatesPerPage)
                    .map((template, index) => (
                      <div key={template.id}>
                        <Card className="overflow-hidden card-hover border-purple-100">
                          <div className="relative">
                            <img  
                              loading="lazy"
                              className="w-full h-64 object-cover"
                              alt={`Template ${template.name}`}
                              src={template.thumbnail || template.image || "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png"} />
                            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                              {template.category && template.category !== 'Custom' && template.category !== 'Custom HTML' && (
                                <span className="px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700 font-semibold border border-purple-200 mt-1">
                                  {template.category}
                                </span>
                              )}
                            </div>
                          </div>
                          <CardContent className="p-6">
                            <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                            <p className="text-gray-600 mb-2">{template.description}</p>
                            <div className="mb-2">
                              {template.discount && Number(template.discount) > 0 ? (
                                <>
                                  <span className="text-gray-400 line-through mr-2 text-sm">Rp{Number(template.price).toLocaleString('id-ID')}</span>
                                  <span className="text-purple-700 font-bold text-lg">Rp{(Number(template.price) * (1 - Number(template.discount)/100)).toLocaleString('id-ID')}</span>
                                  <span className="ml-2 text-xs text-green-600 font-semibold">-{template.discount}%</span>
                                </>
                              ) : (
                                <span className="text-purple-700 font-bold text-lg">Rp{Number(template.price).toLocaleString('id-ID')}</span>
                              )}
                            </div>
                            <div className="flex items-center mb-4">
                              {/* Render static SVG star rating to avoid repeated icon rendering */}
                              <span className="flex">
                                <svg className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                <svg className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                <svg className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                <svg className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                <svg className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                              </span>
                              <span className="ml-2 text-sm text-gray-600">(4.9)</span>
                            </div>
                          </CardContent>
                          <CardFooter className="p-6 pt-0 flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
                              onClick={() => handlePreview(template.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            <Button 
                              className="flex-1 gradient-bg text-white hover:shadow-lg"
                              onClick={() => handleOrder(template.id)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Pesan
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    ))}
                </div>
                {/* Pagination */}
                {templates.length > templatesPerPage && (
                  <div className="flex justify-center mt-8 gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(currentPage - 1);
                        setTimeout(scrollToTemplatesTop, 100);
                      }}
                    >
                      &lt; Prev
                    </Button>
                    {[...Array(Math.ceil(templates.length / templatesPerPage))].map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        onClick={() => {
                          setCurrentPage(i + 1);
                          setTimeout(scrollToTemplatesTop, 100);
                        }}
                        className={currentPage === i + 1 ? "font-bold" : ""}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      disabled={currentPage === Math.ceil(templates.length / templatesPerPage)}
                      onClick={() => {
                        setCurrentPage(currentPage + 1);
                        setTimeout(scrollToTemplatesTop, 100);
                      }}
                    >
                      Next &gt;
                    </Button>
                  </div>
                )}
                {/* Empty state after loading */}
                {templates.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Belum ada template yang dipublikasikan</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Logo size={32} className="h-8 w-auto" />
                </div>
                <p className="text-gray-400">
                  Platform undangan digital terpercaya untuk hari bahagia Anda
                </p>
              </div>
              
              <div>
                <span className="font-semibold mb-4 block">Layanan</span>
                <ul className="space-y-2 text-gray-400">
                  <li>Template Undangan</li>
                  <li>Kustomisasi Desain</li>
                  <li>Wedding Gift Digital</li>
                </ul>
              </div>
              
              <div>
                <span className="font-semibold mb-4 block">Bantuan</span>
                <ul className="space-y-2 text-gray-400">
                  <li>FAQ</li>
                  <li>Panduan</li>
                  <li>Kontak Support</li>
                </ul>
              </div>
              
              <div>
                <span className="font-semibold mb-4 block">Kontak</span>
                <ul className="space-y-2 text-gray-400">
                  <li>Email: info@undangankami.com</li>
                  <li>WhatsApp: +62 812-3456-7890</li>
                  <li>Instagram: @undangankami</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 UndanganKami. Semua hak dilindungi.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Homepage;
