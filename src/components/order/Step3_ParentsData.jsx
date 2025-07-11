import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Step3_ParentsData = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold mb-4 text-purple-800">Orang Tua Mempelai Pria</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="groomFatherName">Nama Ayah</Label>
              <Input
                id="groomFatherName"
                value={formData?.groomFatherName || ""}
                onChange={(e) => handleInputChange && handleInputChange('groomFatherName', e.target.value)}
                placeholder="Nama ayah mempelai pria"
                required
              />
            </div>
            <div>
              <Label htmlFor="groomMotherName">Nama Ibu</Label>
              <Input
                id="groomMotherName"
                value={formData?.groomMotherName || ""}
                onChange={(e) => handleInputChange && handleInputChange('groomMotherName', e.target.value)}
                placeholder="Nama ibu mempelai pria"
                required
              />
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4 text-purple-800">Orang Tua Mempelai Wanita</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="brideFatherName">Nama Ayah</Label>
              <Input
                id="brideFatherName"
                value={formData?.brideFatherName || ""}
                onChange={(e) => handleInputChange && handleInputChange('brideFatherName', e.target.value)}
                placeholder="Nama ayah mempelai wanita"
                required
              />
            </div>
            <div>
              <Label htmlFor="brideMotherName">Nama Ibu</Label>
              <Input
                id="brideMotherName"
                value={formData?.brideMotherName || ""}
                onChange={(e) => handleInputChange && handleInputChange('brideMotherName', e.target.value)}
                placeholder="Nama ibu mempelai wanita"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3_ParentsData;