import React, { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Step5_MusicSelection = ({ formData, handleInputChange, music }) => {
  const safeMusic = Array.isArray(music) ? music : [];
  const quranMusic = safeMusic.filter(m => m.category === 'quran');
  const nasyidMusic = safeMusic.filter(m => m.category === 'nasyid');

  const [previewId, setPreviewId] = useState(null);
  const audioRefs = useRef({});

  const handlePlay = (id) => {
    if (previewId && audioRefs.current[previewId]) {
      audioRefs.current[previewId].pause();
      audioRefs.current[previewId].currentTime = 0;
    }
    setPreviewId(id);
    setTimeout(() => {
      if (audioRefs.current[id]) {
        audioRefs.current[id].currentTime = 0;
        audioRefs.current[id].play();
      }
    }, 100);
  };

  const handleStop = (id) => {
    if (audioRefs.current[id]) {
      audioRefs.current[id].pause();
      audioRefs.current[id].currentTime = 0;
    }
    setPreviewId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="selectedMusic">Pilih Musik Latar</Label>
        <Select value={formData?.selectedMusic || "none"} onValueChange={(value) => handleInputChange && handleInputChange('selectedMusic', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih musik untuk undangan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Tanpa Musik</SelectItem>
            {quranMusic.length > 0 && (
              <>
                <SelectItem disabled value="quran-header" className="font-bold text-gray-500">--- Ayat Al-Qur'an ---</SelectItem>
                {quranMusic.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 px-2 py-1">
                    <SelectItem value={item.id} className="flex-1">{item.title}</SelectItem>
                    {previewId === item.id ? (
                      <button
                        type="button"
                        className="text-purple-600 hover:text-purple-900 text-xs border border-purple-200 rounded px-2 py-1 ml-2"
                        onClick={e => { e.stopPropagation(); handleStop(item.id); }}
                      >
                        Stop
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-purple-600 hover:text-purple-900 text-xs border border-purple-200 rounded px-2 py-1 ml-2"
                        onClick={e => { e.stopPropagation(); handlePlay(item.id); }}
                      >
                        Play
                      </button>
                    )}
                    <audio
                      ref={el => (audioRefs.current[item.id] = el)}
                      src={item.url}
                      onEnded={() => setPreviewId(null)}
                    />
                  </div>
                ))}
              </>
            )}
            {nasyidMusic.length > 0 && (
              <>
                <SelectItem disabled value="nasyid-header" className="font-bold text-gray-500">--- Nasyid ---</SelectItem>
                {nasyidMusic.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 px-2 py-1">
                    <SelectItem value={item.id} className="flex-1">{item.title}</SelectItem>
                    {previewId === item.id ? (
                      <button
                        type="button"
                        className="text-purple-600 hover:text-purple-900 text-xs border border-purple-200 rounded px-2 py-1 ml-2"
                        onClick={e => { e.stopPropagation(); handleStop(item.id); }}
                      >
                        Stop
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-purple-600 hover:text-purple-900 text-xs border border-purple-200 rounded px-2 py-1 ml-2"
                        onClick={e => { e.stopPropagation(); handlePlay(item.id); }}
                      >
                        Play
                      </button>
                    )}
                    <audio
                      ref={el => (audioRefs.current[item.id] = el)}
                      src={item.url}
                      onEnded={() => setPreviewId(null)}
                    />
                  </div>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {formData?.selectedMusic && (
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-purple-800">
            Musik yang dipilih akan diputar otomatis saat undangan dibuka.
          </p>
        </div>
      )}
    </div>
  );
};

export default Step5_MusicSelection;