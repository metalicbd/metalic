import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppRoutes } from '@/routes';
import { HomePage } from '@/pages/public/HomePage';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        {/* গ্লোবাল অথেন্টিকেশন এবং সেন্ট্রাল রাউটিং সিস্টেম */}
        <AppRoutes HomePageComponent={HomePage} />
      </AuthProvider>
    </Router>
  );
};

export default App;