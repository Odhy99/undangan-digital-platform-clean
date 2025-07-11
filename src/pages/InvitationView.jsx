
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Gift, Music, Play, Pause, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const InvitationView = () => {
  const { coupleNames } = useParams();
  const { toast } = useToast();
  const [invitationData, setInvitationData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Load invitation data based on couple names
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      const orders = JSON.parse(savedOrders);
      const invitation = orders.find(order => {
        const orderCoupleNames = `${order.groomNickname}-dan-${order.brideNickname}`;
        return orderCoupleNames.toLowerCase() === coupleNames.toLowerCase();
      });
      
      if (invitation) {
        setInvitationData(invitation);
      }
    }
  }, [coupleNames]);

  // Countdown calculation
  useEffect(() => {
    if (!invitationData) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const weddingTime = new Date(invitationData.akadDate).getTime();
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
  }, [invitationData]);

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Berhasil Disalin!",
        description: `${type} berhasil disalin ke clipboard.`,
      });
    });
  };

  if (!invitationData) {
    return (
      <>
        <Helmet>
          <title>Undangan Digital - UndanganKami</title>
          <meta name="description" content="Undangan pernikahan digital" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center invitation-bg">
          <Card className="glass-effect border-white/20 p-8 text-center">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Undangan Tidak Ditemukan</h2>
              <p className="text-gray-600">Maaf, undangan yang Anda cari tidak ditemukan.</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{invitationData.groomNickname} & {invitationData.brideNickname} - Undangan Pernikahan</title>
        <meta name="description" content={`Undangan pernikahan ${invitationData.groomName} dan ${invitationData.brideName}`} />
      </Helmet>

      <div className="min-h-screen invitation-bg">
        {/* Music Control */}
        <div className="fixed top-4 right-4 z-40">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleMusic}
            className="bg-white/90 backdrop-blur-md"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-md">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="mb-6">
              <img  
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
                alt="Foto mempelai"
               src="https://images.unsplash.com/photo-1614405217589-d9f310df5a6e" />
            </div>
            
            <h1 className="text-3xl font-bold font-playfair text-gray-800 mb-2">
              {invitationData.groomNickname} & {invitationData.brideNickname}
            </h1>
            <p className="text-gray-600 mb-4">
              Dengan memohon rahmat dan ridho Allah SWT
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Menuju Hari Bahagia</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Hari', value: timeLeft.days },
                    { label: 'Jam', value: timeLeft.hours },
                    { label: 'Menit', value: timeLeft.minutes },
                    { label: 'Detik', value: timeLeft.seconds }
                  ].map((item, index) => (
                    <div key={index} className="countdown-digit">
                      <div className="text-xl font-bold">{item.value}</div>
                      <div className="text-xs opacity-80">{item.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Couple Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold font-playfair text-gray-800 mb-4">Mempelai</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="mb-4">
                      <img  
                        className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-purple-200"
                        alt="Foto mempelai pria"
                       src="https://images.unsplash.com/photo-1594759770056-b9ae0768065d" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">{invitationData.groomName}</h4>
                    <p className="text-sm text-gray-600 mb-2">Putra dari:</p>
                    <p className="text-sm text-gray-700">{invitationData.groomFatherName}</p>
                    <p className="text-sm text-gray-700">{invitationData.groomMotherName}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="mb-4">
                      <img  
                        className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-purple-200"
                        alt="Foto mempelai wanita"
                       src="https://images.unsplash.com/photo-1635729573041-a1adfe6068be" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">{invitationData.brideName}</h4>
                    <p className="text-sm text-gray-600 mb-2">Putri dari:</p>
                    <p className="text-sm text-gray-700">{invitationData.brideFatherName}</p>
                    <p className="text-sm text-gray-700">{invitationData.brideMotherName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Event Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 space-y-4"
          >
            {/* Akad */}
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Akad Nikah</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      {new Date(invitationData.akadDate).toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-700 ml-6">Pukul {invitationData.akadTime} WIB</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-1" />
                    <span className="text-gray-700">{invitationData.akadVenue}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reception */}
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Gift className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Resepsi</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">
                      {new Date(invitationData.receptionDate).toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-700 ml-6">Pukul {invitationData.receptionTime} WIB</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-1" />
                    <span className="text-gray-700">{invitationData.receptionVenue}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Wedding Gift */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Gift className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Wedding Gift</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Doa restu Anda merupakan karunia yang sangat berarti bagi kami. 
                  Dan jika memberi adalah ungkapan tanda kasih Anda, Anda dapat memberi kado secara cashless.
                </p>
                
                <div className="space-y-3">
                  {invitationData.weddingGifts.map((gift, index) => (
                    <div key={index} className="bg-white/50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{gift.name}</p>
                          <p className="text-sm text-gray-600">{gift.account}</p>
                          <p className="text-xs text-gray-500">a.n. {gift.holder}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(gift.account, gift.name)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Closing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mb-8"
          >
            <Card className="glass-effect border-white/20">
              <CardContent className="p-6">
                <p className="text-gray-700 italic mb-4">
                  "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu 
                  isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, 
                  dan dijadikan-Nya diantaramu rasa kasih dan sayang. 
                  Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berfikir."
                </p>
                <p className="text-sm text-gray-600 font-semibold">QS. Ar-Rum: 21</p>
                
                <div className="mt-6">
                  <p className="text-gray-700 mb-2">Wassalamu'alaikum Wr. Wb.</p>
                  <p className="text-gray-600 font-semibold">Kami yang berbahagia,</p>
                  <p className="text-gray-800 font-bold">{invitationData.groomNickname} & {invitationData.brideNickname}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm">
            <p>Made with ❤️ by UndanganKami</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvitationView;
