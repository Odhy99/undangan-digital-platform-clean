import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Edit, Trash2, Eye, Construction } from 'lucide-react';
import { deleteTemplate, addTemplate, updateTemplate } from '@/lib/firestore';

const TemplatesContent = ({ templates, setTemplates }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  // Ambil info user login
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem('adminUser')) || null;
  } catch {
    currentUser = null;
  }
  // Filter template jika designer
  let filteredTemplates = templates;
  if (currentUser && currentUser.type === 'designer') {
    filteredTemplates = templates.filter(t => t.createdBy === currentUser.username);
  }

  const handleDelete = async (templateId) => {
    try {
      // Ambil data template
      const template = templates.find(t => t.id === templateId);
      if (template && template.thumbnail) {
        // Ekstrak public_id dari URL Cloudinary
        try {
          const matches = template.thumbnail.match(/\/v\d+\/([^\.]+)\./);
          const public_id = matches ? matches[1] : null;
          if (public_id) {
            await fetch('http://localhost:4000/delete-music', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ public_id, resource_type: 'image' })
            });
          }
        } catch (err) {
          // Optional: tampilkan error hapus
        }
      }
      await deleteTemplate(templateId);
      const updatedTemplates = templates.filter(template => template.id !== templateId);
      setTemplates(updatedTemplates);
      toast({
        title: "Template Dihapus",
        description: "Template berhasil dihapus dari database dan Cloudinary.",
      });
    } catch (err) {
      toast({
        title: "Gagal hapus template",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handlePublish = async (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return toast({ title: 'Template tidak ditemukan', variant: 'destructive' });
    const newStatus = template.status === 'publish' ? 'draft' : 'publish';
    try {
      await updateTemplate(templateId, { ...template, status: newStatus, updatedAt: new Date().toISOString() });
      const updatedTemplates = templates.map(t =>
        t.id === templateId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
      );
      setTemplates(updatedTemplates);
      toast({
        title: "Status Template Diubah",
        description: "Status template berhasil diubah.",
      });
    } catch (err) {
      toast({
        title: "Gagal ubah status template",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleBuild = (templateId) => {
    navigate(`/admin/template-builder/${templateId}`);
  };

  // Duplikat template
  const handleDuplicate = async (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return toast({ title: 'Template tidak ditemukan', variant: 'destructive' });
    // Buat data baru tanpa id, ubah nama
    const { id, createdAt, updatedAt, ...rest } = template;
    const newTemplate = {
      ...rest,
      name: template.name + ' (Copy)',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      const saved = await addTemplate(newTemplate);
      setTemplates(prev => [saved, ...prev]);
      toast({ title: 'Template berhasil diduplikat', description: 'Template baru sudah masuk ke database.' });
    } catch (err) {
      toast({ title: 'Gagal duplikat template', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Kelola Template</h1>
        <Button className="gradient-bg text-white" onClick={() => navigate('/admin/template-builder')}>
          <Construction className="h-4 w-4 mr-2" />
          Buka Template Builder
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
              <div className="relative">
                <img
                  className="w-full h-48 object-cover"
                  alt={`Template ${template.name}`}
                  src={template.thumbnail || "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png"} />
                <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    template.status === 'publish' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}>
                    {template.status}
                  </span>
                  {/* Badge kategori di dashboard/kelola template disembunyikan sesuai permintaan */}
                </div>
              </div>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
              <p className="text-gray-600 text-sm mb-2 h-10 overflow-hidden">{template.description}</p>
              <div className="mb-2">
                {template.discount && Number(template.discount) > 0 ? (
                  <>
                    <span className="text-gray-400 line-through mr-2 text-sm">Rp{Number(template.price).toLocaleString('id-ID')}</span>
                    <span className="text-purple-700 font-bold text-lg">Rp{(Number(template.price) * (1 - Number(template.discount)/100)).toLocaleString('id-ID')}</span>
                    <span className="ml-2 text-xs text-green-600 font-semibold">-{template.discount}%</span>
                  </>
                ) : (
                  <span className="text-purple-700 font-bold text-lg">Rp{Number(template.price).toLocaleString('id-ID')}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleBuild(template.id)}
                  disabled={currentUser && currentUser.type === 'designer' && template.createdBy !== currentUser.username}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handlePublish(template.id)}
                  className={
                    template.status === 'publish'
                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800'
                      : 'bg-white text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  disabled={currentUser && currentUser.type === 'designer' && template.createdBy !== currentUser.username}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDelete(template.id)}
                  className="text-red-600 hover:bg-red-50"
                  disabled={currentUser && currentUser.type === 'designer' && template.createdBy !== currentUser.username}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-blue-600 hover:bg-blue-50"
                  onClick={() => handleDuplicate(template.id)}
                  title="Duplikat Template"
                >
                  Duplikat
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
       {filteredTemplates.length === 0 && (
          <div className="text-center py-12 col-span-full">
            <p className="text-gray-500 text-lg">Belum ada template. Buat di Template Builder!</p>
          </div>
        )}
    </div>
  );
};

export default TemplatesContent;