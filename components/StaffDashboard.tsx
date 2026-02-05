
import React, { useEffect, useRef, useState } from 'react';
import { Order, WaiterCall, MenuItem, TableLayout } from '../types';
import { Bell, CheckCircle2, Clock, LayoutGrid, Utensils, Settings, X, MessageSquareQuote, HelpCircle, Droplets, Receipt, Sparkles, UtensilsCrossed, MessageSquare, RefreshCcw, Move, Maximize2, Save, Plus, Edit3, Banknote, ImagePlus, Star } from 'lucide-react';

interface StaffDashboardProps {
  orders: Order[];
  calls: WaiterCall[];
  menuItems: MenuItem[];
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updatePaymentStatus: (id: string, status: Order['paymentStatus']) => void;
  updateMenuItemImage: (id: string, imageUrl: string) => void;
  resolveCall: (id: string) => void;
  clearRespondedCalls: () => void;
  refreshData: () => void;
}

interface StaffSettings {
  isMuted: boolean;
  soundType: 'bell' | 'chime' | 'digital';
  enableTTS: boolean;
  volume: number;
}

const CALL_LABELS: Record<WaiterCall['type'], { label: string, icon: React.ReactNode, color: string }> = {
  help: { label: 'Yardım İstedi', icon: <HelpCircle size={14} />, color: 'text-orange-600' },
  water: { label: 'Su İstedi', icon: <Droplets size={14} />, color: 'text-blue-600' },
  bill: { label: 'Hesap İstedi', icon: <Receipt size={14} />, color: 'text-green-600' },
  clean: { label: 'Temizlik İstedi', icon: <Sparkles size={14} />, color: 'text-purple-600' },
  cutlery: { label: 'Servis İstedi', icon: <UtensilsCrossed size={14} />, color: 'text-indigo-600' },
  other: { label: 'Diğer İstek', icon: <MessageSquare size={14} />, color: 'text-gray-600' }
};

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ 
  orders, 
  calls, 
  menuItems,
  updateOrderStatus, 
  updatePaymentStatus, 
  updateMenuItemImage,
  resolveCall,
  clearRespondedCalls,
  refreshData
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'menu'>('overview');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [tableLayouts, setTableLayouts] = useState<TableLayout[]>(() => {
    const saved = localStorage.getItem('qs_table_layouts');
    if (saved) return JSON.parse(saved);
    return Array.from({ length: 12 }, (_, i) => ({
      id: (i + 1).toString(),
      x: (i % 4) * 25 + 5,
      y: Math.floor(i / 4) * 20 + 5,
      w: 80,
      h: 80
    }));
  });

  const [draggedTable, setDraggedTable] = useState<{ id: string, startX: number, startY: number, initialX: number, initialY: number } | null>(null);
  const [resizedTable, setResizedTable] = useState<{ id: string, startX: number, startY: number, initialW: number, initialH: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<StaffSettings>(() => {
    const saved = localStorage.getItem('qs_staff_settings');
    return saved ? JSON.parse(saved) : {
      isMuted: false,
      soundType: 'chime',
      enableTTS: true,
      volume: 0.5
    };
  });

  useEffect(() => {
    localStorage.setItem('qs_staff_settings', JSON.stringify(settings));
  }, [settings]);

  const activeCalls = calls.filter(c => c.status === 'pending');
  const activeOrders = orders.filter(o => o.status !== 'completed');
  
  const prevCallsCount = useRef(activeCalls.length);
  const prevOrdersCount = useRef(activeOrders.length);

  const speak = (text: string) => {
    if (!settings.enableTTS || settings.isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.volume = settings.volume;
    window.speechSynthesis.speak(utterance);
  };

  const playNotificationSound = (previewType?: StaffSettings['soundType']) => {
    const type = previewType || settings.soundType;
    if (settings.isMuted && !previewType) return;
    
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    if (type === 'bell') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
    } else if (type === 'digital') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime + 0.2);
    } else {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(660, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2);
      oscillator.frequency.exponentialRampToValueAtTime(660, audioCtx.currentTime + 0.4);
    }

    gainNode.gain.setValueAtTime(settings.volume * 0.2, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.6);
  };

  useEffect(() => {
    if (activeCalls.length > prevCallsCount.current) {
      playNotificationSound();
      const newestCall = activeCalls[activeCalls.length - 1];
      const callInfo = CALL_LABELS[newestCall.type]?.label || 'istek';
      speak(`Masa ${newestCall.tableId} ${callInfo} bekliyor.`);
    }
    prevCallsCount.current = activeCalls.length;

    if (activeOrders.length > prevOrdersCount.current) {
      playNotificationSound();
      const newestOrder = activeOrders[activeOrders.length - 1];
      speak(`Masa ${newestOrder.tableId} yeni bir sipariş verdi.`);
    }
    prevOrdersCount.current = activeOrders.length;
  }, [activeCalls.length, activeOrders.length]);

  const getTableData = (tableId: string) => {
    const tableCalls = activeCalls.filter(c => c.tableId === tableId);
    const tableOrders = activeOrders.filter(o => o.tableId === tableId);
    
    // Masa toplamı (henüz tamamlanmamış siparişler)
    const tableTotal = orders
      .filter(o => o.tableId === tableId && o.status !== 'completed')
      .reduce((sum, o) => sum + o.total, 0);

    const layout = tableLayouts.find(t => t.id === tableId);
    return { tableCalls, tableOrders, tableTotal, layout };
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const saveLayout = () => {
    localStorage.setItem('qs_table_layouts', JSON.stringify(tableLayouts));
    setIsEditMode(false);
  };

  const addTable = () => {
    const nextId = (Math.max(0, ...tableLayouts.map(t => parseInt(t.id) || 0)) + 1).toString();
    const newTable: TableLayout = {
      id: nextId,
      name: `Masa ${nextId}`,
      x: 10,
      y: 10,
      w: 80,
      h: 80
    };
    setTableLayouts(prev => [...prev, newTable]);
  };

  const removeTable = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTableLayouts(prev => prev.filter(t => t.id !== id));
    if (selectedTable === id) setSelectedTable(null);
  };

  const updateTableName = (id: string, name: string) => {
    setTableLayouts(prev => prev.map(t => t.id === id ? { ...t, name } : t));
  };

  const onMouseDown = (id: string, e: React.MouseEvent) => {
    if (!isEditMode) return;
    const table = tableLayouts.find(t => t.id === id);
    if (!table) return;
    setDraggedTable({ id, startX: e.clientX, startY: e.clientY, initialX: table.x, initialY: table.y });
  };

  const onResizeStart = (id: string, e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    const table = tableLayouts.find(t => t.id === id);
    if (!table) return;
    setResizedTable({ id, startX: e.clientX, startY: e.clientY, initialW: table.w, initialH: table.h });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (draggedTable) {
      const dx = ((e.clientX - draggedTable.startX) / rect.width) * 100;
      const dy = ((e.clientY - draggedTable.startY) / rect.height) * 100;
      setTableLayouts(prev => prev.map(t => t.id === draggedTable.id ? { 
        ...t, 
        x: Math.max(0, Math.min(95, draggedTable.initialX + dx)), 
        y: Math.max(0, Math.min(95, draggedTable.initialY + dy)) 
      } : t));
    }

    if (resizedTable) {
      const dw = e.clientX - resizedTable.startX;
      const dh = e.clientY - resizedTable.startY;
      setTableLayouts(prev => prev.map(t => t.id === resizedTable.id ? { 
        ...t, 
        w: Math.max(40, resizedTable.initialW + dw), 
        h: Math.max(40, resizedTable.initialH + dh) 
      } : t));
    }
  };

  const onMouseUp = () => {
    setDraggedTable(null);
    setResizedTable(null);
  };

  return (
    <div className="min-h-full bg-slate-50 pb-32" onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <div className="bg-white border-b sticky top-[68px] z-30 shadow-sm">
        <div className="px-4 flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="flex gap-6">
            <button 
              onClick={() => {setActiveView('overview'); setIsEditMode(false);}}
              className={`py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeView === 'overview' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
            >
              Masa Planı
            </button>
            <button 
              onClick={() => setActiveView('menu')}
              className={`py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeView === 'menu' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-400'}`}
            >
              Menü Ayarları
            </button>
          </div>
          
          <div className="flex items-center gap-2 py-3 sm:py-0 border-t sm:border-t-0 border-slate-50">
            {activeView === 'overview' && (
              <div className="flex gap-2">
                {isEditMode && (
                  <button 
                    onClick={addTable}
                    className="p-2 bg-blue-500 text-white rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-blue-600 transition-all active:scale-95"
                  >
                    <Plus size={14} />
                    <span className="text-[9px] font-black uppercase tracking-tight">Ekle</span>
                  </button>
                )}
                <button 
                  onClick={() => isEditMode ? saveLayout() : setIsEditMode(true)}
                  className={`p-2 rounded-lg transition-all flex items-center gap-1.5 border shadow-sm ${isEditMode ? 'bg-green-500 text-white border-green-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  {isEditMode ? <Save size={14} /> : <Move size={14} />}
                  <span className="text-[9px] font-black uppercase tracking-tight">{isEditMode ? 'KAYDET' : 'DÜZENLE'}</span>
                </button>
              </div>
            )}
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 bg-white text-slate-500 border border-slate-100 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Settings size={14} />
              <span className="text-[9px] font-black uppercase tracking-tight">AYARLAR</span>
            </button>

            <button onClick={handleRefresh} disabled={isRefreshing} className="p-2 bg-white text-slate-500 border border-slate-100 rounded-lg shadow-sm">
              <RefreshCcw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {activeView === 'overview' ? (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black flex items-center gap-2 text-slate-800 uppercase tracking-tighter">
                <LayoutGrid className="text-indigo-500" size={20} /> Kat Planı {isEditMode && <span className="text-[10px] text-orange-500 font-bold ml-2">(Düzenleme Modu)</span>}
              </h2>
            </div>

            <div 
              ref={containerRef}
              className={`bg-white rounded-[2.5rem] border-2 shadow-sm relative overflow-hidden h-[500px] transition-all ${isEditMode ? 'border-orange-200 cursor-crosshair' : 'border-slate-200'}`}
              style={{
                backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            >
              {tableLayouts.map(layout => {
                const { tableCalls, tableOrders, tableTotal } = getTableData(layout.id);
                const hasCall = tableCalls.length > 0;
                const hasOrder = tableOrders.length > 0;
                const isSelected = selectedTable === layout.id;

                return (
                  <div 
                    key={layout.id}
                    onMouseDown={(e) => onMouseDown(layout.id, e)}
                    onClick={() => setSelectedTable(isSelected ? null : layout.id)}
                    className={`absolute group rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer ${
                      hasCall ? 'bg-red-50 border-red-500 shadow-xl shadow-red-200 animate-pulse ring-4 ring-red-500/20' :
                      hasOrder ? 'bg-blue-50 border-blue-400 shadow-sm' :
                      'bg-white border-slate-100 hover:border-slate-300'
                    } ${isSelected ? 'ring-4 ring-orange-500/20 z-20 scale-105 border-orange-500' : 'z-10'}`}
                    style={{
                      left: `${layout.x}%`,
                      top: `${layout.y}%`,
                      width: `${layout.w}px`,
                      height: `${layout.h}px`
                    }}
                  >
                    <span className={`text-[12px] font-black text-center px-1 truncate w-full transition-colors ${isSelected ? 'text-orange-600' : 'text-slate-700'}`}>
                      {layout.name || `T${layout.id}`}
                    </span>
                    
                    {/* HESAP TUTARI ROZETİ */}
                    {!isEditMode && tableTotal > 0 && (
                      <div className="mt-1 px-1.5 py-0.5 bg-emerald-600 rounded-md shadow-sm transform border border-emerald-700">
                        <span className="text-[10px] font-black text-white whitespace-nowrap tracking-tight leading-none">
                          {tableTotal}₺
                        </span>
                      </div>
                    )}
                    
                    {isEditMode && (
                      <>
                        <button 
                          onClick={(e) => removeTable(layout.id, e)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors z-30"
                        >
                          <X size={10} />
                        </button>
                        <div onMouseDown={(e) => onResizeStart(layout.id, e)} className="absolute bottom-1 right-1 cursor-nwse-resize text-orange-400"><Maximize2 size={12} /></div>
                        <div className="absolute top-1 left-1 text-slate-300 pointer-events-none"><Move size={12} /></div>
                      </>
                    )}
                    
                    {!isEditMode && hasCall && (
                      <div className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg animate-bounce">
                        <Bell size={12} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Aktif Çağrılar */}
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                  <h3 className="text-sm font-black text-red-700 uppercase tracking-widest flex items-center gap-2">
                    <Bell size={16} /> Aktif Çağrılar
                  </h3>
                  <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{activeCalls.length}</span>
                </div>
                <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
                  {activeCalls.length === 0 ? (
                    <div className="py-12 text-center text-slate-300 flex flex-col items-center gap-2">
                      <CheckCircle2 size={32} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Bekleyen Çağrı Yok</p>
                    </div>
                  ) : (
                    activeCalls.map(call => {
                      const l = tableLayouts.find(t => t.id === call.tableId);
                      return (
                        <div key={call.id} className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-red-200 transition-colors shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs text-center px-1">
                              {l?.name || call.tableId}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{(CALL_LABELS[call.type] || CALL_LABELS.other).label}</p>
                              <p className="text-[9px] text-slate-400 font-medium">{new Date(call.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <button onClick={() => resolveCall(call.id)} className="px-4 py-2 bg-red-600 text-white text-[9px] font-black rounded-xl uppercase tracking-widest active:scale-95 transition-all shadow-md shadow-red-100">Gidildi</button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Aktif Siparişler */}
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
                  <h3 className="text-sm font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                    <Utensils size={16} /> Aktif Siparişler
                  </h3>
                  <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{activeOrders.length}</span>
                </div>
                <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
                  {activeOrders.length === 0 ? (
                    <div className="py-12 text-center text-slate-300 flex flex-col items-center gap-2">
                      <Clock size={32} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Aktif Sipariş Yok</p>
                    </div>
                  ) : (
                    activeOrders.map(order => {
                      const l = tableLayouts.find(t => t.id === order.tableId);
                      return (
                        <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3 hover:border-blue-200 transition-colors shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-xs text-center px-1">
                                {l?.name || order.tableId}
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">#{order.id.toUpperCase()}</p>
                                <p className="text-xs font-black text-blue-600 uppercase mt-0.5">
                                  {order.status === 'pending' ? 'Bekliyor' : order.status === 'preparing' ? 'Hazırlanıyor' : 'Servis Edildi'}
                                </p>
                              </div>
                            </div>
                            <p className="text-[9px] text-slate-400 font-medium">{new Date(order.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                          <div className="space-y-1.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="text-[11px] font-bold text-slate-700">
                                <span className="text-orange-500">{item.quantity}x</span> {item.name}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            {order.status === 'pending' && <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="flex-1 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl">HAZIRLA</button>}
                            {order.status === 'preparing' && <button onClick={() => updateOrderStatus(order.id, 'served')} className="flex-1 py-2 bg-orange-500 text-white text-[10px] font-black rounded-xl">SERVİS ET</button>}
                            {order.status === 'served' && <button onClick={() => updateOrderStatus(order.id, 'completed')} className="flex-1 py-2 bg-green-600 text-white text-[10px] font-black rounded-xl">TAMAMLA</button>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {selectedTable && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setSelectedTable(null)}>
                <div 
                  className="bg-white w-full max-w-[340px] rounded-[2rem] p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
                  onClick={e => e.stopPropagation()}
                >
                  {(() => {
                    const details = getTableData(selectedTable);
                    return (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xs text-center px-1">
                              {details.layout?.name || selectedTable}
                            </div>
                            <h3 className="font-black text-slate-800">Masa İşlemleri</h3>
                          </div>
                          <button onClick={() => setSelectedTable(null)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={20}/></button>
                        </div>

                        <div className="space-y-4 max-h-[50vh] overflow-y-auto no-scrollbar pr-1">
                          {isEditMode && (
                            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 space-y-3">
                              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5"><Edit3 size={12} /> Masa Adını Değiştir</p>
                              <input 
                                type="text" 
                                value={details.layout?.name || ''}
                                onChange={(e) => updateTableName(selectedTable, e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-orange-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Masa İsmi"
                              />
                            </div>
                          )}

                          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between shadow-sm">
                            <div>
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">GÜNCEL HESAP</p>
                              <p className="text-2xl font-black text-emerald-700">{details.tableTotal}₺</p>
                            </div>
                            <div className="bg-emerald-600 p-2 rounded-xl text-white">
                              <Banknote size={24} />
                            </div>
                          </div>

                          {!isEditMode && details.tableCalls.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Aktif Çağrılar</p>
                              {details.tableCalls.map(call => (
                                <div key={call.id} className="bg-red-50 p-3 rounded-xl flex items-center justify-between border border-red-100">
                                  <span className="text-xs font-bold text-red-800">{(CALL_LABELS[call.type] || CALL_LABELS.other).label}</span>
                                  <button onClick={() => resolveCall(call.id)} className="px-3 py-1.5 bg-red-600 text-white text-[9px] font-black rounded-lg">GİDİLDİ</button>
                                </div>
                              ))}
                            </div>
                          )}

                          {!isEditMode && details.tableOrders.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Sipariş Detayları</p>
                              {details.tableOrders.map(order => (
                                <div key={order.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                                  <div className="flex justify-between text-[10px] font-black text-slate-400">
                                    <span>#{order.id.toUpperCase()}</span>
                                    <span className="uppercase text-blue-600">{order.status === 'pending' ? 'BEKLİYOR' : order.status === 'preparing' ? 'HAZIRLANIYOR' : 'SERVİS EDİLDİ'}</span>
                                  </div>
                                  <div className="space-y-1">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="text-[11px] font-bold text-slate-700">
                                        <span className="text-orange-500">{item.quantity}x</span> {item.name}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex gap-2">
                                    {order.status === 'pending' && <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="flex-1 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg">HAZIRLA</button>}
                                    {order.status === 'preparing' && <button onClick={() => updateOrderStatus(order.id, 'served')} className="flex-1 py-2 bg-orange-500 text-white text-[10px] font-black rounded-lg">SERVİS ET</button>}
                                    {order.status === 'served' && <button onClick={() => updateOrderStatus(order.id, 'completed')} className="flex-1 py-2 bg-green-600 text-white text-[10px] font-black rounded-lg">TAMAMLA</button>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button onClick={() => setSelectedTable(null)} className="w-full mt-6 py-4 bg-slate-100 text-slate-600 text-[10px] font-black rounded-2xl uppercase tracking-widest">Kapat</button>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="grid gap-3">
            {menuItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  <p className="text-xs text-orange-600 font-black">{item.price}₺</p>
                </div>
                <label className="p-3 text-slate-300 hover:text-orange-500 cursor-pointer transition-colors">
                  <ImagePlus size={20} />
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => updateMenuItemImage(item.id, reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 space-y-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personel Ayarları</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
            </div>
            <div className="space-y-8">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SES DURUMU</p>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                  <button onClick={() => setSettings({...settings, isMuted: false})} className={`flex-1 py-3.5 rounded-xl text-[11px] font-black transition-all ${!settings.isMuted ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>AÇIK</button>
                  <button onClick={() => setSettings({...settings, isMuted: true})} className={`flex-1 py-3.5 rounded-xl text-[11px] font-black transition-all ${settings.isMuted ? 'bg-white shadow text-slate-900' : 'text-slate-400'}`}>KAPALI</button>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SES SEVİYESİ</p>
                <input type="range" min="0" max="1" step="0.05" value={settings.volume} onChange={(e) => setSettings({...settings, volume: parseFloat(e.target.value)})} className="w-full accent-indigo-600" />
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SESLİ OKUMA (TTS)</p>
                <button onClick={() => setSettings({...settings, enableTTS: !settings.enableTTS})} className={`w-full py-5 rounded-2xl border-2 font-black text-[12px] transition-all ${settings.enableTTS ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-400'}`}>
                  {settings.enableTTS ? 'TTS AKTİF' : 'TTS PASİF'}
                </button>
              </div>
            </div>
            <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[2rem] font-black text-[13px] uppercase tracking-widest shadow-2xl transition-all">TAMAM</button>
          </div>
        </div>
      )}
    </div>
  );
};
