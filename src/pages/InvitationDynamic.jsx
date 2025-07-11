import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { getAllOrders } from '@/lib/firestore';

const InvitationDynamic = () => {
  const { id } = useParams();
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHtml() {
      setLoading(true);
      const orders = await getAllOrders();
      const order = orders.find(o => {
        if (!o.invitationLink) return false;
        const match = o.invitationLink.match(/\/invitation\/([^/?#]+)/);
        return match && match[1] === id;
      });
      if (order && order.invitationHtml) {
        setHtml(order.invitationHtml);
      } else {
        setHtml('');
      }
      setLoading(false);
    }
    fetchHtml();
  }, [id]);

  useEffect(() => {
    if (!html) return;
    setTimeout(() => {
      const container = document.getElementById("invitation-container");
      if (!container) return;
      const scripts = container.querySelectorAll("script");
      scripts.forEach((oldScript) => {
        const newScript = document.createElement("script");
        for (const attr of oldScript.attributes) {
          newScript.setAttribute(attr.name, attr.value);
        }
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }, 0);
  }, [html]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="mb-4"
        >
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="28" r="24" stroke="#a78bfa" strokeWidth="6" opacity="0.2" />
            <path d="M52 28c0-13.255-10.745-24-24-24" stroke="#8b5cf6" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-purple-500 text-lg font-semibold"
        >
          Memuat undangan...
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.2, duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
          className="text-gray-400 mt-2"
        >
          Mohon tunggu sebentar, kami sedang mengambil undangan terbaik untuk Anda.
        </motion.p>
      </div>
    );
  }
  if (!html) {
    return <div className="min-h-screen flex items-center justify-center">Undangan tidak ditemukan.</div>;
  }
  return <div id="invitation-container" dangerouslySetInnerHTML={{ __html: html }} />;
};

export default InvitationDynamic;
