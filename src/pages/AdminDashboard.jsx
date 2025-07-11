import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Music, 
  CreditCard, 
  Users, 
  Settings,
  LogOut,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { getSiteSettings } from '@/lib/siteSettings';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import DashboardContent from '@/components/admin/DashboardContent';
import TemplatesContent from '@/components/admin/TemplatesContent';
import MusicContent from '@/components/admin/MusicContent';
import OrdersContent from '@/components/admin/OrdersContent';
import PaymentContent from '@/components/admin/PaymentContent';
import UsersContent from '@/components/admin/UsersContent';
import SettingsContent from '@/components/admin/SettingsContent';
import { getAllTemplates, getPaymentInfo, setPaymentInfo as setPaymentInfoFirestore, subscribeOrders } from '@/lib/firestore';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  // Baca tab dari query string jika ada
  const getTabFromQuery = () => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'dashboard';
  };
  const [activeTab, setActiveTab] = useState(getTabFromQuery());
  // Ambil info user login dari localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('adminUser')) || null;
    } catch {
      return null;
    }
  });
  const [templates, setTemplates] = useState([]);
  const [music, setMusic] = useState([]);
  const [orders, setOrders] = useState([]);
  // Fetch orders as soon as dashboard mounts (for sidebar badge)
  useEffect(() => {
    // Subscribe realtime ke koleksi orders
    const unsubscribe = subscribeOrders((ordersData) => {
      setOrders(ordersData);
      localStorage.setItem('orders', JSON.stringify(ordersData)); // optional: sync ke localStorage
    });
    return () => unsubscribe();
  }, []);
  const [paymentInfo, setPaymentInfo] = useState({
    banks: [],
    ewallets: []
  });

  // Check authentication
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
    // Sync user info jika reload
    try {
      setCurrentUser(JSON.parse(localStorage.getItem('adminUser')) || null);
    } catch {
      setCurrentUser(null);
    }
  }, [navigate]);


  // Load data dari Firestore (template & paymentInfo) dan localStorage (lainnya)
  useEffect(() => {
    const loadData = async () => {
      // Ambil siteSettings (logo) dari Firestore dan simpan ke localStorage
      try {
        const settings = await getSiteSettings();
        if (settings) {
          localStorage.setItem('siteSettings', JSON.stringify(settings));
        }
      } catch {}

      // Ambil template dari Firestore
      try {
        const firestoreTemplates = await getAllTemplates();
        setTemplates(firestoreTemplates);
      } catch (err) {
        setTemplates([]);
      }

      // Music & orders masih dari localStorage
      const savedMusic = localStorage.getItem('music');
      if (savedMusic) {
        setMusic(JSON.parse(savedMusic));
      } else {
        setMusic([]);
        localStorage.setItem('music', JSON.stringify([]));
      }

      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      // Ambil paymentInfo dari Firestore
      try {
        const firestorePaymentInfo = await getPaymentInfo();
        setPaymentInfo(firestorePaymentInfo);
      } catch (err) {
        setPaymentInfo({ banks: [], ewallets: [] });
      }
    };
    loadData();
    // eslint-disable-next-line
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari dashboard admin.",
    });
    navigate('/admin/login');
  };

  // Menu berdasarkan role
  let menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'templates', label: 'Template', icon: FileText },
    { id: 'music', label: 'Musik', icon: Music },
    { id: 'orders', label: 'Pesanan', icon: CreditCard },
    { id: 'payment', label: 'Pembayaran', icon: CreditCard },
    { id: 'users', label: 'User', icon: Users },
    { id: 'settings', label: 'Pengaturan', icon: Settings }
  ];
  if (currentUser && currentUser.type === 'cs') {
    menuItems = [
      { id: 'orders', label: 'Pesanan', icon: CreditCard }
    ];
    // Paksa tab ke orders jika bukan orders
    if (activeTab !== 'orders') {
      setTimeout(() => setActiveTab('orders'), 0);
    }
  }
  if (currentUser && currentUser.type === 'designer') {
    menuItems = [
      { id: 'templates', label: 'Template', icon: FileText }
    ];
    // Paksa tab ke templates jika bukan templates
    if (activeTab !== 'templates') {
      setTimeout(() => setActiveTab('templates'), 0);
    }
  }

  const renderContent = () => {
    if (currentUser && currentUser.type === 'cs') {
      return <OrdersContent orders={orders} setOrders={setOrders} templates={templates} />;
    }
    if (currentUser && currentUser.type === 'designer') {
      return <TemplatesContent templates={templates} setTemplates={setTemplates} />;
    }
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent templates={templates} orders={orders} />;
      case 'templates':
        return <TemplatesContent templates={templates} setTemplates={setTemplates} />;
      case 'music':
        return <MusicContent music={music} setMusic={setMusic} />;
      case 'orders':
        return <OrdersContent orders={orders} setOrders={setOrders} templates={templates} />;
      case 'payment':
        return <PaymentContent paymentInfo={paymentInfo} setPaymentInfo={setPaymentInfo} />;
      case 'users':
        return <UsersContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <DashboardContent templates={templates} orders={orders} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard Admin - UndanganKami</title>
        <meta name="description" content="Dashboard admin untuk mengelola platform UndanganKami" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex relative">
        {/* Sidebar */}
        <div className="w-64 admin-sidebar text-white flex flex-col">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <Logo size={40} className="h-10 w-auto" />
              {/* Logo caption dihapus sesuai permintaan */}
            </div>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                // Hitung badge pesanan baru
                let badge = null;
                if (item.id === 'orders') {
                  const newOrderCount = orders.filter(o => o.status === 'pending').length;
                  if (newOrderCount > 0) {
                    badge = (
                      <span
                        className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-semibold w-6 h-6 animate-bounce shadow"
                        title={`Ada ${newOrderCount} pesanan baru`}
                      >
                        {newOrderCount}
                      </span>
                    );
                  }
                }
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex items-center">{item.label}{badge}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="mt-auto p-6">
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              className="w-full text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
        {/* Sticky Theme Toggle Bottom Right */}
        <div className="fixed right-6 bottom-6 z-50">
          <ThemeToggle />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;