import React, { useState, useRef, useEffect } from 'react';
import { getAllMusic, addMusic, deleteMusic } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Play, Pause } from 'lucide-react';

const MusicPlayer = ({ item, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  // Ambil loadingDelete dari parent
  const { loadingDelete } = React.useContext(MusicDeleteLoadingContext);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.file}</p>
          </div>
          <div className="flex items-center gap-2">
            <audio ref={audioRef} src={item.url} onEnded={() => setIsPlaying(false)} />
            <Button size="sm" variant="outline" onClick={togglePlay}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onDelete(item.id)}
              className="text-red-600 hover:bg-red-50"
              disabled={loadingDelete[item.id]}
            >
              {loadingDelete[item.id] ? (
                <svg className="animate-spin h-4 w-4 mr-1 text-red-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MusicContent = ({ music, setMusic }) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'quran',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // State untuk loading hapus per musik
  const [loadingDelete, setLoadingDelete] = useState({});

  // Load music from Firestore
  useEffect(() => {
    getAllMusic().then(setMusic);
  }, []);

  // Upload audio ke Cloudinary
  const uploadToCloudinary = (file, onProgress) => {
    return new Promise((resolve, reject) => {
      const CLOUD_NAME = 'dkfue0nxr';
      const UPLOAD_PRESET = 'unsigned_preset';
      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          // Kembalikan secure_url dan resource_type
          resolve({
            secure_url: data.secure_url,
            resource_type: data.resource_type || 'auto',
          });
        } else {
          reject(new Error('Upload gagal'));
        }
      };
      xhr.onerror = () => reject(new Error('Upload gagal'));
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      xhr.send(formData);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast({
        title: "File Audio Diperlukan",
        description: "Silakan pilih file audio untuk diunggah.",
        variant: "destructive"
      });
      return;
    }
    if (formData.file.size > 10 * 1024 * 1024) {
      toast({
        title: "Ukuran File Terlalu Besar",
        description: "Ukuran file audio maksimal 10MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    let audioData = '';
    try {
      audioData = await uploadToCloudinary(formData.file, setUploadProgress);
    } catch (err) {
      setUploading(false);
      setUploadProgress(0);
      toast({ title: "Gagal upload ke Cloudinary", description: err.message, variant: "destructive" });
      return;
    }
    setUploading(false);
    setUploadProgress(0);

    // Extract public_id from Cloudinary URL
    function getCloudinaryPublicId(url) {
      const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
      if (matches && matches[1]) {
        return matches[1];
      }
      return null;
    }

    const newMusic = {
      title: formData.title,
      category: formData.category,
      file: formData.file.name,
      url: audioData.secure_url,
      public_id: getCloudinaryPublicId(audioData.secure_url),
      resource_type: audioData.resource_type,
      createdAt: new Date().toISOString()
    };

    // Simpan ke Firestore, dapatkan id Firestore
    const saved = await addMusic(newMusic);
    // Update state langsung (tanpa reload semua data)
    setMusic((prev) => [...prev, saved]);
    toast({
      title: "Musik Ditambahkan",
      description: "Musik baru berhasil diupload ke Cloudinary.",
    });
    setIsDialogOpen(false);
    setFormData({ title: '', category: 'quran', file: null });
  };

  const handleDelete = async (musicId) => {
    setLoadingDelete(prev => ({ ...prev, [musicId]: true }));
    // Cari item berdasarkan id Firestore
    const item = music.find(m => m.id === musicId);
    if (!item) return;
    // Hapus dari Cloudinary jika ada public_id
    let cloudinaryError = null;
    if (item.public_id) {
      try {
        await fetch('http://localhost:4000/delete-music', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: item.public_id, resource_type: item.resource_type || 'auto' })
        });
      } catch (err) {
        cloudinaryError = err;
      }
    }
    try {
      await deleteMusic(item.id); // id Firestore
      setMusic((prev) => prev.filter(m => m.id !== item.id));
      toast({
        title: "Musik Dihapus",
        description: cloudinaryError
          ? "Metadata dihapus dari database, tapi file Cloudinary gagal dihapus."
          : "Musik berhasil dihapus dari dashboard, database, dan Cloudinary.",
        variant: cloudinaryError ? "destructive" : undefined
      });
    } catch (err) {
      toast({
        title: "Gagal hapus metadata di Firestore",
        description: err.message,
        variant: "destructive"
      });
    }
    setLoadingDelete(prev => ({ ...prev, [musicId]: false }));
  };

  return (
    <div>
      <MusicDeleteLoadingContext.Provider value={{ loadingDelete }}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Kelola Musik</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-white">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Musik
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Musik Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Judul</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quran">Ayat Al-Qur'an</SelectItem>
                    <SelectItem value="nasyid">Nasyid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file">File Audio</Label>
                <Input
                  id="file"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setFormData({ ...formData, file: e.target.files[0] || null })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? 'Menyimpan...' : 'Simpan'}
              </Button>
              {uploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-purple-500 h-3 rounded-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1 text-center">Uploading: {uploadProgress}%</div>
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="quran" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quran">Ayat Al-Qur'an</TabsTrigger>
          <TabsTrigger value="nasyid">Nasyid</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quran" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {music.filter(item => item.category === 'quran').map((item) => (
              <MusicPlayer key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="nasyid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {music.filter(item => item.category === 'nasyid').map((item) => (
              <MusicPlayer key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      </MusicDeleteLoadingContext.Provider>
    </div>
  );
};

// Context untuk passing loadingDelete ke MusicPlayer
export const MusicDeleteLoadingContext = React.createContext({ loadingDelete: {} });

export default MusicContent;