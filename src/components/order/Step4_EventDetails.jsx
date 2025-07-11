import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

const Step4_EventDetails = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-4 text-purple-800">Akad Nikah</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="akadDate">Tanggal</Label>
            <Input
              id="akadDate"
              type="date"
              value={formData?.akadDate || ""}
              onChange={(e) => handleInputChange && handleInputChange('akadDate', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="akadTime">Waktu</Label>
            <div className="flex gap-2">
              <Input
                id="akadTime"
                type="time"
                value={formData?.akadTime || ""}
                onChange={(e) => handleInputChange && handleInputChange('akadTime', e.target.value)}
                required
              />
              <Select value={formData?.akadTimezone || 'WIB'} onValueChange={val => handleInputChange && handleInputChange('akadTimezone', val)}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WIB">WIB</SelectItem>
                  <SelectItem value="WITA">WITA</SelectItem>
                  <SelectItem value="WIT">WIT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="akadVenue">Tempat</Label>
          <Textarea
            id="akadVenue"
            value={formData?.akadVenue || ""}
            onChange={(e) => handleInputChange && handleInputChange('akadVenue', e.target.value)}
            placeholder="Alamat lengkap tempat akad nikah"
            required
          />
        </div>
        <div className="mt-2">
          <Label htmlFor="akadMapLink">Link Google Maps Akad</Label>
          <Input
            id="akadMapLink"
            type="url"
            value={formData?.akadMapLink || ""}
            onChange={(e) => handleInputChange && handleInputChange('akadMapLink', e.target.value)}
            placeholder="https://maps.google.com/..."
          />
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mb-4 text-purple-800">Resepsi</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="receptionDate">Tanggal</Label>
            <Input
              id="receptionDate"
              type="date"
              value={formData?.receptionDate || ""}
              onChange={(e) => handleInputChange && handleInputChange('receptionDate', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="receptionTime">Waktu</Label>
            <div className="flex gap-2">
              <Input
                id="receptionTime"
                type="time"
                value={formData?.receptionTime || ""}
                onChange={(e) => handleInputChange && handleInputChange('receptionTime', e.target.value)}
                required
              />
              <Select value={formData?.receptionTimezone || 'WIB'} onValueChange={val => handleInputChange && handleInputChange('receptionTimezone', val)}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WIB">WIB</SelectItem>
                  <SelectItem value="WITA">WITA</SelectItem>
                  <SelectItem value="WIT">WIT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="receptionVenue">Tempat</Label>
          <Textarea
            id="receptionVenue"
            value={formData?.receptionVenue || ""}
            onChange={(e) => handleInputChange && handleInputChange('receptionVenue', e.target.value)}
            placeholder="Alamat lengkap tempat resepsi"
            required
          />
        </div>
        <div className="mt-2">
          <Label htmlFor="receptionMapLink">Link Google Maps Resepsi</Label>
          <Input
            id="receptionMapLink"
            type="url"
            value={formData?.receptionMapLink || ""}
            onChange={(e) => handleInputChange && handleInputChange('receptionMapLink', e.target.value)}
            placeholder="https://maps.google.com/..."
          />
        </div>
      </div>
    </div>
  );
};

export default Step4_EventDetails;