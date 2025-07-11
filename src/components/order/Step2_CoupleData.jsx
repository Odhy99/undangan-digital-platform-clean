import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Step2_CoupleData = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-4 text-purple-800">Data Mempelai Pria</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="groomName">Nama Lengkap</Label>
              <Input
                id="groomName"
                value={formData.groomName}
                onChange={(e) => handleInputChange('groomName', e.target.value)}
                placeholder="Nama lengkap mempelai pria"
                required
              />
            </div>
            <div>
              <Label htmlFor="groomNickname">Nama Panggilan</Label>
              <Input
                id="groomNickname"
                value={formData.groomNickname}
                onChange={(e) => handleInputChange('groomNickname', e.target.value)}
                placeholder="Nama panggilan"
                required
              />
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4 text-purple-800">Data Mempelai Wanita</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="brideName">Nama Lengkap</Label>
              <Input
                id="brideName"
                value={formData.brideName}
                onChange={(e) => handleInputChange('brideName', e.target.value)}
                placeholder="Nama lengkap mempelai wanita"
                required
              />
            </div>
            <div>
              <Label htmlFor="brideNickname">Nama Panggilan</Label>
              <Input
                id="brideNickname"
                value={formData.brideNickname}
                onChange={(e) => handleInputChange('brideNickname', e.target.value)}
                placeholder="Nama panggilan"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2_CoupleData;