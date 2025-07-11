

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getSiteSettings, setSiteSettings } from '@/lib/siteSettings';

const defaultSettings = {
  siteName: '',
  logoLight: '',
  logoDark: '',
};

const SettingsContent = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState(defaultSettings);
  const [previewLight, setPreviewLight] = useState('');
  const [previewDark, setPreviewDark] = useState('');
  const fileInputLight = useRef();
  const fileInputDark = useRef();


  useEffect(() => {
    async function fetchSettings() {
      const saved = await getSiteSettings();
      if (saved) {
        setSettings(saved);
        setPreviewLight(saved.logoLight || '');
        setPreviewDark(saved.logoDark || '');
      }
    }
    fetchSettings();
  }, []);

  const handleLogoChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'File harus berupa gambar.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Ukuran logo maksimal 2MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSettings((prev) => ({ ...prev, [type]: ev.target.result }));
      if (type === 'logoLight') setPreviewLight(ev.target.result);
      if (type === 'logoDark') setPreviewDark(ev.target.result);
    };
    reader.readAsDataURL(file);
  };


  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await setSiteSettings(settings);
      toast({ title: 'Pengaturan logo berhasil disimpan!' });
    } catch (err) {
      toast({ title: 'Gagal menyimpan ke server', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-2">
        <Settings className="h-8 w-8 text-primary" /> Pengaturan Logo Website
      </h1>
      <Card className="max-w-2xl mx-auto shadow-lg border border-gray-200 dark:border-gray-700">
        <CardContent className="p-8">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="font-semibold text-base">Logo (Light Mode)</Label>
                <Input type="file" accept="image/*" ref={fileInputLight} onChange={(e) => handleLogoChange(e, 'logoLight')} className="mt-2" />
                {previewLight && (
                  <div className="flex flex-col items-center mt-2">
                    <span className="text-xs text-gray-500 mb-1">Preview</span>
                    <div className="bg-white border rounded shadow p-2 flex items-center justify-center min-h-[60px]">
                      <img src={previewLight} alt="Logo Light" className="h-16 object-contain" />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={async () => {
                        setSettings((prev) => ({ ...prev, logoLight: '' }));
                        setPreviewLight('');
                        if (fileInputLight.current) fileInputLight.current.value = '';
                        try {
                          await setSiteSettings({ ...settings, logoLight: '' });
                          toast({ title: 'Logo Light berhasil dihapus!' });
                        } catch (err) {
                          toast({ title: 'Gagal menghapus logo', description: err.message, variant: 'destructive' });
                        }
                      }}
                    >
                      Hapus Logo Light
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-base">Logo (Dark Mode)</Label>
                <Input type="file" accept="image/*" ref={fileInputDark} onChange={(e) => handleLogoChange(e, 'logoDark')} className="mt-2" />
                {previewDark && (
                  <div className="flex flex-col items-center mt-2">
                    <span className="text-xs text-gray-500 mb-1">Preview</span>
                    <div className="bg-gray-900 border rounded shadow p-2 flex items-center justify-center min-h-[60px]">
                      <img src={previewDark} alt="Logo Dark" className="h-16 object-contain" />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={async () => {
                        setSettings((prev) => ({ ...prev, logoDark: '' }));
                        setPreviewDark('');
                        if (fileInputDark.current) fileInputDark.current.value = '';
                        try {
                          await setSiteSettings({ ...settings, logoDark: '' });
                          toast({ title: 'Logo Dark berhasil dihapus!' });
                        } catch (err) {
                          toast({ title: 'Gagal menghapus logo', description: err.message, variant: 'destructive' });
                        }
                      }}
                    >
                      Hapus Logo Dark
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-center pt-4">
              <Button type="submit" className="px-8 py-2 text-base font-semibold">Simpan Logo</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsContent;