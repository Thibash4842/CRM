import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import AIInsightsPanel from '../ui/AIInsightsPanel';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const isFinanceRoute = ['/quotes', '/invoices', '/payments', '/expenses', '/reports'].some(path => 
    location.pathname.startsWith(path)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6 max-w-[1600px] mx-auto relative">
          <Outlet />
        </main>
      </div>
      {isFinanceRoute && <AIInsightsPanel />}
    </div>
  );
}
