import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Pencil, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getAllUsers, addUser, updateUser, deleteUser as deleteUserFirestore } from '@/lib/firestore';


const UsersContent = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', type: 'admin', whatsapp: '' });
  const [editId, setEditId] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        toast({ title: 'Gagal memuat user', description: err.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const openDialog = (user) => {
    if (user) {
      setFormData({ username: user.username, password: user.password, type: user.type, whatsapp: user.whatsapp || '' });
      setEditId(user.id);
    } else {
      setFormData({ username: '', password: '', type: 'admin', whatsapp: '' });
      setEditId(null);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.type === 'cs' && (!formData.whatsapp || formData.whatsapp.trim() === '')) {
      toast({ title: 'Nomor WhatsApp wajib diisi untuk Customer Service', variant: 'destructive' });
      return;
    }
    try {
      if (editId) {
        // Edit mode
        await updateUser(editId, formData);
        toast({ title: 'User berhasil diedit', description: `Username: ${formData.username}, Tipe: ${formData.type}` });
      } else {
        // Add mode
        await addUser(formData);
        toast({ title: 'User berhasil ditambahkan', description: `Username: ${formData.username}, Tipe: ${formData.type}` });
      }
      // Refresh user list
      const data = await getAllUsers();
      setUsers(data);
      setFormData({ username: '', password: '', type: 'admin', whatsapp: '' });
      setEditId(null);
      setIsDialogOpen(false);
    } catch (err) {
      toast({ title: 'Gagal menyimpan user', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUserFirestore(id);
      const data = await getAllUsers();
      setUsers(data);
      toast({ title: 'User berhasil dihapus' });
    } catch (err) {
      toast({ title: 'Gagal menghapus user', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manajemen User</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Daftar User</CardTitle>
              <Button onClick={() => openDialog(null)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-400 text-sm">Memuat data user...</p>
              ) : users.length === 0 ? (
                <p className="text-gray-400 text-sm">Belum ada user.</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {user.type === 'admin' ? 'Admin' : user.type === 'cs' ? 'Customer Service' : 'Designer'}
                        {user.type === 'cs' && user.whatsapp ? (
                          <span className="block text-xs text-green-600">WA: {user.whatsapp}</span>
                        ) : null}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openDialog(user)} className="text-blue-600 hover:bg-blue-50">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(user.id)} className="text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Tambah/Edit User */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditId(null);
          setFormData({ username: '', password: '', type: 'admin', whatsapp: '' });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit User' : 'Tambah User'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Username"
                required
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password"
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Tipe User</Label>
              <select
                id="type"
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="admin">Admin (kendali penuh)</option>
                <option value="cs">Customer Service (akses pesanan, tidak bisa hapus)</option>
                <option value="designer">Designer (akses template miliknya saja)</option>
              </select>
            </div>
            {formData.type === 'cs' && (
              <div>
                <Label htmlFor="whatsapp">Nomor WhatsApp (Customer Service)</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  required={formData.type === 'cs'}
                />
              </div>
            )}
            <Button type="submit" className="w-full">
              {editId ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersContent;