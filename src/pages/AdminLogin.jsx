import React, { useState } from 'react';
import { getAllUsers } from '@/lib/firestore';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Lock, User, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ambil user dari Firestore
      const users = await getAllUsers();
      // Cek user custom (plain password, sementara)
      const foundUser = users.find(
        (u) => u.username === formData.username && u.password === formData.password
      );
      if (foundUser) {
        localStorage.setItem('adminLoggedIn', 'true');
        // Simpan info user yang login (opsional, bisa dipakai untuk role)
        localStorage.setItem('adminUser', JSON.stringify(foundUser));
        toast({
          title: "Login Berhasil!",
          description: "Selamat datang di dashboard admin.",
        });
        navigate('/admin');
      } else {
        toast({
          title: "Login Gagal",
          description: "Username atau password salah.",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Login Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - UndanganKami</title>
        <meta name="description" content="Login ke dashboard admin UndanganKami" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="glass-effect border-white/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-600 rounded-full">
                  <Heart className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white font-playfair">
                Admin Login
              </CardTitle>
              <p className="text-purple-200">Masuk ke dashboard admin</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-purple-300" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Masukkan username"
                      value={formData.username}
                      onChange={handleChange}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-300" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Masukkan password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full gradient-bg text-white hover:shadow-lg transition-all"
                >
                  Masuk
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/')}
                  className="text-purple-200 hover:text-white hover:bg-white/10"
                >
                  Kembali ke Homepage
                </Button>
              </div>

              {/* Demo login info removed for security */}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default AdminLogin;