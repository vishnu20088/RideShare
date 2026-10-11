import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import DashboardSidebar from './DashboardSidebar';

export const DashboardLayout = ({ role = 'passenger' }) => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content" style={{ padding: '36px 0', backgroundColor: '#f8fafc' }}>
        <div className="container" style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
          <DashboardSidebar role={role} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
