
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { MenuSection } from './components/MenuSection';
import { AIChat } from './components/AIChat';
import { CartSheet } from './components/CartSheet';
import { StaffDashboard } from './components/StaffDashboard';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerOrders } from './components/CustomerOrders';
import { ToastContainer } from './components/ToastContainer';
import { MENU_ITEMS as INITIAL_MENU } from './constants';
import { MenuItem, CartItem, Order, WaiterCall, ViewMode, Toast } from './types';
import { Info, X, QrCode, MessageSquare, Droplets, Receipt, Sparkles, UtensilsCrossed, HelpCircle } from 'lucide-react';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('customer');
  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu');
  const [tableId, setTableId] = useState<string>("12"); // Simulated table ID from QR
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [calls, setCalls] = useState<WaiterCall[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const loadData = useCallback(() => {
    const savedOrders = localStorage.getItem('qs_orders');
    const savedCalls = localStorage.getItem('qs_calls');
    const savedMenu = localStorage.getItem('qs_menu');
    
    if (savedOrders) setOrders(JSON.parse(savedOrders).map((o: any) => ({ ...o, timestamp: new Date(o.timestamp) })));
    if (savedCalls) setCalls(JSON.parse(savedCalls).map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) })));
    if (savedMenu) setMenuItems(JSON.parse(savedMenu));
  }, []);

  // Persistence (Simulated server)
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    localStorage.setItem('qs_orders', JSON.stringify(orders));
    localStorage.setItem('qs_calls', JSON.stringify(calls));
    localStorage.setItem('qs_menu', JSON.stringify(menuItems));
  }, [orders, calls, menuItems]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, note: '' }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const updateCartItemNote = (id: string, note: string) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, note } : item));
  };

  const finalizeOrder = (paymentStatus: Order['paymentStatus'] = 'pending') => {
    if (cart.length === 0) return;
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 6),
      tableId,
      items: [...cart],
      status: 'pending',
      paymentStatus: paymentStatus,
      timestamp: new Date(),
      total: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0)
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setIsCheckoutOpen(false);
    setActiveTab('orders'); // Auto-switch to orders to show success
    
    if (paymentStatus === 'paid') {
      addToast("Ödemeniz alındı ve siparişiniz mutfağa iletildi!", "success");
    } else {
      addToast("Siparişiniz başarıyla alındı!", "success");
    }
  };

  const callWaiter = (type: WaiterCall['type']) => {
    const newCall: WaiterCall = {
      id: Math.random().toString(36).substr(2, 9),
      tableId,
      type,
      status: 'pending',
      timestamp: new Date()
    };
    setCalls(prev => [newCall, ...prev]);
    setIsWaiterModalOpen(false);
    addToast("Garson çağrıldı, hemen geliyoruz!", "info");
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    
    // Notify customer (simulated)
    const order = orders.find(o => o.id === id);
    if (order && order.tableId === tableId) {
      if (status === 'preparing') addToast(`Masa ${order.tableId}: Siparişiniz hazırlanıyor!`, "success");
      if (status === 'served') addToast(`Masa ${order.tableId}: Siparişiniz yolda!`, "success");
      if (status === 'completed') addToast(`Masa ${order.tableId}: Siparişiniz tamamlandı!`, "info");
    }
  };

  const cancelOrder = (id: string) => {
    const order = orders.find(o => o.id === id);
    if (order && order.status === 'pending') {
      setOrders(prev => prev.filter(o => o.id !== id));
      addToast("Siparişiniz iptal edildi.", "warning");
    } else {
      addToast("Hazırlanmaya başlayan siparişler iptal edilemez.", "warning");
    }
  };

  const updatePaymentStatus = (id: string, paymentStatus: Order['paymentStatus']) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus } : o));
    const order = orders.find(o => o.id === id);
    if (order && order.tableId === tableId && paymentStatus === 'paid') {
      addToast(`Masa ${order.tableId}: Ödeme onaylandı. Teşekkürler!`, "success");
    }
  };

  const resolveCall = (id: string) => {
    setCalls(prev => prev.map(c => c.id === id ? { ...c, status: 'responded' as const } : c));
  };

  const clearRespondedCalls = () => {
    setCalls(prev => prev.filter(c => c.status === 'pending'));
    addToast("Tamamlanan çağrılar temizlendi.", "info");
  };

  const refreshData = () => {
    loadData();
    addToast("Veriler yenilendi.", "success");
  };

  const updateMenuItemImage = (id: string, imageUrl: string) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, image: imageUrl } : item));
    addToast("Menü fotoğrafı güncellendi", "success");
  };

  const simulateQRScan = () => {
    const newTable = prompt("Masa Numarasını Girin (Simülasyon):", "5");
    if (newTable) {
      setTableId(newTable);
      addToast(`Masa ${newTable} olarak giriş yapıldı.`, "info");
    }
  };

  return (
    <Layout 
      mode={viewMode} 
      setMode={setViewMode} 
      tableId={tableId} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {viewMode === 'customer' ? (
        <>
          {activeTab === 'menu' ? (
            <>
              <div className="relative h-48 sm:h-64">
                <img 
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800" 
                  alt="Restaurant" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="text-2xl font-bold text-gray-900 drop-shadow-sm">Gurme Restoran</h1>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                    <span className="bg-white/80 px-2 py-1 rounded-full border">4.8 ★ (200+)</span>
                    <span className="bg-white/80 px-2 py-1 rounded-full border">15-30 dk</span>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
                  <Info size={20} className="text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-900">Hoş Geldiniz!</p>
                    <p className="text-xs text-blue-700 leading-relaxed">Menümüzü inceleyebilir, sağ alttaki yapay zeka asistanımızdan öneri alabilirsiniz.</p>
                  </div>
                </div>
              </div>

              <MenuSection 
                items={menuItems} 
                cart={cart} 
                addToCart={addToCart} 
                removeFromCart={removeFromCart}
                updateCartItemNote={updateCartItemNote}
              />
            </>
          ) : (
            <CustomerOrders orders={orders} tableId={tableId} cancelOrder={cancelOrder} />
          )}
          
          <AIChat cart={cart} />
          <CartSheet 
            cart={cart} 
            onOrder={() => finalizeOrder('pending')} 
            onPay={() => setIsCheckoutOpen(true)} 
          />

          <button 
            onClick={simulateQRScan}
            className="fixed top-20 right-4 bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-lg border border-gray-100 text-gray-600 z-50 hover:bg-white transition-all active:scale-95"
            title="QR Simülasyonu"
          >
            <QrCode size={20} />
          </button>

          <CheckoutModal 
            isOpen={isCheckoutOpen} 
            onClose={() => setIsCheckoutOpen(false)} 
            cart={cart} 
            onPaymentSuccess={() => finalizeOrder('paid')}
            updateCartItemNote={updateCartItemNote}
          />

          {isWaiterModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-md rounded-t-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom duration-300 shadow-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-black text-gray-800 tracking-tight">Nasıl Yardımcı Olabiliriz?</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Hızlı Garson Çağırma</p>
                  </div>
                  <button onClick={() => setIsWaiterModalOpen(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={20}/></button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => callWaiter('help')} className="flex flex-col items-center justify-center p-6 bg-orange-50 text-orange-600 rounded-3xl font-black border border-orange-100 hover:bg-orange-100 transition-all active:scale-95 gap-3">
                    <HelpCircle size={32} />
                    <span className="text-[11px] uppercase tracking-widest text-center">Yardım İste</span>
                  </button>
                  <button onClick={() => callWaiter('water')} className="flex flex-col items-center justify-center p-6 bg-blue-50 text-blue-600 rounded-3xl font-black border border-blue-100 hover:bg-blue-100 transition-all active:scale-95 gap-3">
                    <Droplets size={32} />
                    <span className="text-[11px] uppercase tracking-widest text-center">Su Getir</span>
                  </button>
                  <button onClick={() => callWaiter('bill')} className="flex flex-col items-center justify-center p-6 bg-green-50 text-green-600 rounded-3xl font-black border border-green-100 hover:bg-green-100 transition-all active:scale-95 gap-3">
                    <Receipt size={32} />
                    <span className="text-[11px] uppercase tracking-widest text-center">Hesap İste</span>
                  </button>
                  <button onClick={() => callWaiter('clean')} className="flex flex-col items-center justify-center p-6 bg-purple-50 text-purple-600 rounded-3xl font-black border border-purple-100 hover:bg-purple-100 transition-all active:scale-95 gap-3">
                    <Sparkles size={32} />
                    <span className="text-[11px] uppercase tracking-widest text-center">Masa Temizliği</span>
                  </button>
                  <button onClick={() => callWaiter('cutlery')} className="flex flex-col items-center justify-center p-6 bg-indigo-50 text-indigo-600 rounded-3xl font-black border border-indigo-100 hover:bg-indigo-100 transition-all active:scale-95 gap-3">
                    <UtensilsCrossed size={32} />
                    <span className="text-[11px] uppercase tracking-widest text-center">Çatal / Peçete</span>
                  </button>
                  <button onClick={() => callWaiter('other')} className="flex flex-col items-center justify-center p-6 bg-gray-50 text-gray-600 rounded-3xl font-black border border-gray-200 hover:bg-gray-100 transition-all active:scale-95 gap-3">
                    <MessageSquare size={32} />
                    <span className="text-[11px] uppercase tracking-widest text-center">Diğer İstekler</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="hidden" id="waiter-modal-bridge" onClick={() => setIsWaiterModalOpen(true)}></div>
        </>
      ) : (
        <StaffDashboard 
          orders={orders} 
          calls={calls} 
          menuItems={menuItems}
          updateOrderStatus={updateOrderStatus} 
          updatePaymentStatus={updatePaymentStatus}
          updateMenuItemImage={updateMenuItemImage}
          resolveCall={resolveCall}
          clearRespondedCalls={clearRespondedCalls}
          refreshData={refreshData}
        />
      )}
    </Layout>
  );
};

export default App;
