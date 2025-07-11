import React from 'react';

const Step1_TemplateInfo = ({ template }) => {
  return (
    <div className="text-center">
      <img
        className="w-48 h-64 object-cover mx-auto rounded-lg mb-4 shadow-lg"
        alt={`Template ${template.name}`}
        src={template.thumbnail || template.image || "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png"} />
      <h3 className="text-2xl font-bold mb-2">{template.name}</h3>
      <p className="text-gray-600 mb-2">{template.description}</p>
      <div className="mb-4">
        {template.discount && Number(template.discount) > 0 ? (
          <>
            <span className="text-gray-400 line-through mr-2 text-sm">Rp{Number(template.price).toLocaleString('id-ID')}</span>
            <span className="text-purple-700 font-bold text-xl">Rp{(Number(template.price) * (1 - Number(template.discount)/100)).toLocaleString('id-ID')}</span>
            <span className="ml-2 text-xs text-green-600 font-semibold">-{template.discount}%</span>
          </>
        ) : (
          <span className="text-purple-700 font-bold text-xl">Rp{Number(template.price).toLocaleString('id-ID')}</span>
        )}
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-purple-800">
          Template ini akan digunakan untuk undangan digital Anda.
        </p>
      </div>
    </div>
  );
};

export default Step1_TemplateInfo;