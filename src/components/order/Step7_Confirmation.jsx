import React from 'react';

const Step7_Confirmation = ({ formData, music }) => {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-300">Ringkasan Pesanan</h4>
      
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="font-semibold mb-2">Template</h5>
          <p>{formData.templateName}</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="font-semibold mb-2">Mempelai</h5>
          <p>{formData.groomName} ({formData.groomNickname}) & {formData.brideName} ({formData.brideNickname})</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="font-semibold mb-2">Acara</h5>
          <p><strong>Akad:</strong> {new Date(formData.akadDate).toLocaleDateString()} - {formData.akadVenue}</p>
          <p><strong>Resepsi:</strong> {new Date(formData.receptionDate).toLocaleDateString()} - {formData.receptionVenue}</p>
        </div>
        
        {formData.selectedMusic && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h5 className="font-semibold mb-2">Musik</h5>
            <p>{music.find(m => m.id === formData.selectedMusic)?.title || 'Musik dipilih'}</p>
          </div>
        )}
        
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="font-semibold mb-2">Wedding Gift</h5>
          {formData.weddingGifts.map((gift, index) => (
            <p key={index}>{gift.name} - {gift.account} (a.n. {gift.holder})</p>
          ))}
        </div>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
        <p className="text-purple-800 dark:text-purple-200 text-center">
          Setelah menekan tombol "Pesan", Anda akan menerima informasi pembayaran. 
          Undangan akan diproses setelah bukti pembayaran dikirim.
        </p>
      </div>
    </div>
  );
};

export default Step7_Confirmation;