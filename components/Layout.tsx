
import React from 'react';
import { ViewMode } from '../types';
import { ChefHat, User, Bell, ChevronLeft, ReceiptText } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  mode: ViewMode;
  setMode: (mode: ViewMode) => void;
  tableId?: string;
  activeTab: 'menu' | 'orders';
  setActiveTab: (tab: 'menu' | 'orders') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, mode, setMode, tableId, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-white shadow-xl relative">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-2 rounded-lg text-white">
            <ChefHat size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-800 tracking-tight">QuickServe</h1>
            {tableId && <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Masa {tableId}</span>}
          </div>
        </div>
        
        <button 
          onClick={() => setMode(mode === 'customer' ? 'staff' : 'customer')}
          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
        >
          {mode === 'customer' ? (
            <><Bell size={14} className="text-orange-500" /> Personel Girişi</>
          ) : (
            <><User size={14} className="text-blue-500" /> Müşteri Modu</>
          )}
        </button>
      </header>

      <main className="flex-1 pb-32">
        {children}
      </main>

      {mode === 'customer' && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white/90 backdrop-blur-md border-t flex justify-around p-3 z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <NavItem 
            icon={<ChefHat size={24} />} 
            label="Menü" 
            active={activeTab === 'menu'} 
            onClick={() => setActiveTab('menu')} 
          />
          <NavItem 
            icon={<ReceiptText size={24} />} 
            label="Siparişlerim" 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')} 
          />
          <NavItem 
            icon={<Bell size={24} />} 
            label="Garson" 
            onClick={() => document.getElementById('waiter-modal-bridge')?.click()} 
          />
        </nav>
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-orange-500 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
  >
    {icon}
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);
