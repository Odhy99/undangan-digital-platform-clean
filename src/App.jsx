import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Homepage from '@/pages/Homepage';
import OrderForm from '@/pages/OrderForm';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminLogin from '@/pages/AdminLogin';
import InvitationView from '@/pages/InvitationView.jsx';
import InvitationDynamic from '@/pages/InvitationDynamic.jsx';
import TemplatePreview from '@/pages/TemplatePreview';
import TemplateBuilder from '@/pages/TemplateBuilder';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/order/:templateId" element={<OrderForm />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/template-builder" element={<TemplateBuilder />} />
          <Route path="/admin/template-builder/:templateId" element={<TemplateBuilder />} />
          <Route path="/preview/:templateId" element={<TemplatePreview />} />
          {/* <Route path="/inv/:coupleNames" element={<InvitationView />} /> */}
          <Route path="/invitation/:id" element={<InvitationDynamic />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;