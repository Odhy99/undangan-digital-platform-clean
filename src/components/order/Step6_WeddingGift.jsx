import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Step6_WeddingGift = ({ formData, handleWeddingGiftChange, addWeddingGift, removeWeddingGift }) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-4 text-purple-800">Informasi Wedding Gift (Cashless)</h4>
        <p className="text-gray-600 mb-4">
          Tambahkan informasi rekening atau e-wallet untuk memudahkan tamu memberikan hadiah kepadamu.
        </p>
      </div>

      {formData.weddingGifts.map((gift, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4 relative">
          <div className="flex justify-between items-center">
            <h5 className="font-semibold">Opsi Wedding Gift {index + 1}</h5>
            {formData.weddingGifts.length > 1 && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => removeWeddingGift(index)}
                className="text-red-600 hover:bg-red-50 hover:text-red-600"
              >
                Hapus
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Jenis</Label>
              <Select 
                value={gift.type} 
                onValueChange={(value) => handleWeddingGiftChange(index, 'type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="ewallet">E-wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nama {gift.type === 'bank' ? 'Bank' : 'E-wallet'}</Label>
              <Input
                value={gift.name}
                onChange={(e) => handleWeddingGiftChange(index, 'name', e.target.value)}
                placeholder={gift.type === 'bank' ? 'Bank BCA' : 'Dana'}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nomor {gift.type === 'bank' ? 'Rekening' : 'E-wallet'}</Label>
              <Input
                value={gift.account}
                onChange={(e) => handleWeddingGiftChange(index, 'account', e.target.value)}
                placeholder={gift.type === 'bank' ? '1234567890' : '081234567890'}
                required
              />
            </div>
            <div>
              <Label>Nama Pemilik</Label>
              <Input
                value={gift.holder}
                onChange={(e) => handleWeddingGiftChange(index, 'holder', e.target.value)}
                placeholder="Nama pemilik rekening"
                required
              />
            </div>
          </div>
        </div>
      ))}

      <Button 
        type="button" 
        variant="outline" 
        onClick={addWeddingGift}
        className="w-full"
      >
        Tambah Opsi Wedding Gift
      </Button>
    </div>
  );
};

export default Step6_WeddingGift;