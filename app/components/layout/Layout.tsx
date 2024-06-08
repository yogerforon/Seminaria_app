import React from 'react';
import Header from './layout/Header';
import Sidebar from './layout/Sidebar';
import Footer from './layout/Footer';

const AdminLayout: React.FC = ({ children }) => {
  return (
    <div className="admin-layout">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
}

export default AdminLayout;