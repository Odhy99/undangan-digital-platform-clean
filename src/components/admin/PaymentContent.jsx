import React, { useState } from 'react';
import { setPaymentInfo as setPaymentInfoFirestore } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';

const PaymentContent = ({ paymentInfo, setPaymentInfo }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('bank'); // 'bank' or 'ewallet'
  const [formData, setFormData] = useState({
    name: '',
    account: '',
    holder: ''
  });
  const [editId, setEditId] = useState(null); // id item yang sedang diedit

  const handleSubmit = async (e) => {
    e.preventDefault();
    const key = dialogType === 'bank' ? 'banks' : 'ewallets';
    let updatedArr = Array.isArray(paymentInfo[key]) ? paymentInfo[key] : [];
    let action = 'ditambahkan';
    let updatedPaymentInfo;
    if (editId) {
      // Edit mode
      updatedArr = updatedArr.map(item =>
        item.id === editId ? { ...item, ...formData } : item
      );
      action = 'diedit';
      updatedPaymentInfo = {
        ...paymentInfo,
        [key]: updatedArr
      };
    } else {
      // Add mode
      const newItem = {
        id: Date.now().toString(),
        ...formData
      };
      updatedPaymentInfo = {
        ...paymentInfo,
        [key]: [...updatedArr, newItem]
      };
    }
    setPaymentInfo(updatedPaymentInfo);
    try {
      await setPaymentInfoFirestore(updatedPaymentInfo);
    } catch (err) {
      toast({ title: 'Gagal menyimpan ke Firestore', description: err.message || 'Terjadi error.' });
      return;
    }
    toast({
      title: `Informasi Pembayaran ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: `${dialogType === 'bank' ? 'Bank' : 'E-wallet'} berhasil ${action}.`,
    });
    setIsDialogOpen(false);
    setFormData({ name: '', account: '', holder: '' });
    setEditId(null);
  };

  const handleDelete = async (type, id) => {
    const updatedPaymentInfo = {
      ...paymentInfo,
      [type]: paymentInfo[type].filter(item => item.id !== id)
    };
    setPaymentInfo(updatedPaymentInfo);
    try {
      await setPaymentInfoFirestore(updatedPaymentInfo);
    } catch (err) {
      toast({ title: 'Gagal menghapus di Firestore', description: err.message || 'Terjadi error.' });
      return;
    }
    toast({
      title: "Informasi Pembayaran Dihapus",
      description: "Informasi pembayaran berhasil dihapus.",
    });
  };

  const openDialog = (type) => {
    setDialogType(type);
    setFormData({ name: '', account: '', holder: '' });
    setEditId(null);
    setIsDialogOpen(true);
  };

  // Untuk edit: buka dialog, isi form, set editId
  const openEditDialog = (type, item) => {
    setDialogType(type);
    setFormData({ name: item.name, account: item.account, holder: item.holder });
    setEditId(item.id);
    setIsDialogOpen(true);
  };

  // Tambahkan default value agar tidak error jika paymentInfo, banks, atau ewallets undefined/null
  const banks = Array.isArray(paymentInfo?.banks) ? paymentInfo.banks : [];
  const ewallets = Array.isArray(paymentInfo?.ewallets) ? paymentInfo.ewallets : [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Kelola Informasi Pembayaran</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bank Accounts */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Rekening Bank</CardTitle>
              <Button onClick={() => openDialog('bank')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {banks.map((bank) => (
                <div key={bank.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{bank.name}</p>
                    <p className="text-gray-600">{bank.account}</p>
                    <p className="text-sm text-gray-500">{bank.holder}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog('bank', bank)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete('banks', bank.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* E-wallets */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>E-wallet</CardTitle>
              <Button onClick={() => openDialog('ewallet')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ewallets.map((ewallet) => (
                <div key={ewallet.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{ewallet.name}</p>
                    <p className="text-gray-600">{ewallet.account}</p>
                    <p className="text-sm text-gray-500">{ewallet.holder}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog('ewallet', ewallet)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDelete('ewallets', ewallet.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditId(null);
          setFormData({ name: '', account: '', holder: '' });
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editId ? 'Edit' : 'Tambah'} {dialogType === 'bank' ? 'Rekening Bank' : 'E-wallet'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">
                Nama {dialogType === 'bank' ? 'Bank' : 'E-wallet'}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={dialogType === 'bank' ? 'Bank BCA' : 'Dana'}
                required
              />
            </div>
            <div>
              <Label htmlFor="account">
                Nomor {dialogType === 'bank' ? 'Rekening' : 'E-wallet'}
              </Label>
              <Input
                id="account"
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                placeholder={dialogType === 'bank' ? '1234567890' : '081234567890'}
                required
              />
            </div>
            <div>
              <Label htmlFor="holder">Nama Pemilik</Label>
              <Input
                id="holder"
                value={formData.holder}
                onChange={(e) => setFormData({ ...formData, holder: e.target.value })}
                placeholder="Nama Pemilik Rekening"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {editId ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentContent;