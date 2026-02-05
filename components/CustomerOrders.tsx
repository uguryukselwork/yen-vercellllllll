
import React from 'react';
import { Order } from '../types';
import { Clock, CheckCircle2, MapPin, Package, MessageSquareQuote, Trash2, Receipt, Wallet } from 'lucide-react';

interface CustomerOrdersProps {
  orders: Order[];
  tableId: string;
  cancelOrder: (id: string) => void;
}

export const CustomerOrders: React.FC<CustomerOrdersProps> = ({ orders, tableId, cancelOrder }) => {
  const myOrders = orders.filter(o => o.tableId === tableId);
  const totalBill = myOrders.reduce((sum, order) => sum + order.total, 0);

  if (myOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
          <Package size={40} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Henüz Siparişiniz Yok</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-[250px]">
            Masadan verdiğiniz siparişleri buradan takip edebilirsiniz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-black text-gray-800">Sipariş Takibi</h2>
        <div className="bg-orange-50 px-3 py-1 rounded-full border border-orange-100 flex items-center gap-1.5">
          <Receipt size={12} className="text-orange-600" />
          <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest">Masa {tableId}</span>
        </div>
      </div>

      {/* Toplam Hesap Özeti */}
      <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-gray-400 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Wallet size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">MASA TOPLAM HESAP</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black tracking-tighter">{totalBill}</span>
            <span className="text-xl font-bold text-orange-500">₺</span>
          </div>
          <div className="mt-6 flex gap-2">
            <button 
              onClick={() => document.getElementById('waiter-modal-bridge')?.click()}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-6 py-3 rounded-2xl uppercase tracking-widest transition-all active:scale-95 border border-white/10"
            >
              Hesabı İste
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">SİPARİŞ GEÇMİŞİ</h3>
        </div>

        {myOrders.map(order => (
          <div key={order.id} className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SİPARİŞ KODU</span>
                <p className="font-mono text-xs font-bold text-gray-600">#{order.id.toUpperCase()}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 ${
                  order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'served' ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {order.status === 'pending' && <Clock size={12} />}
                  {order.status === 'preparing' && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                  {order.status === 'served' && <MapPin size={12} />}
                  {order.status === 'completed' && <CheckCircle2 size={12} />}
                  {order.status === 'pending' ? 'Onay Bekliyor' :
                   order.status === 'preparing' ? 'Hazırlanıyor' :
                   order.status === 'served' ? 'Masaya Geliyor' : 'Tamamlandı'}
                </div>
                {order.status === 'pending' && (
                  <button 
                    onClick={() => cancelOrder(order.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={10} /> İptal Et
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">{item.quantity}x {item.name}</span>
                    <span className="font-bold text-gray-800">{item.price * item.quantity}₺</span>
                  </div>
                  {item.note && (
                    <div className="flex items-start gap-1 text-[10px] text-gray-400 italic bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                      <MessageSquareQuote size={10} className="mt-0.5 text-orange-500" />
                      <span>Notunuz: {item.note}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SİPARİŞ TOPLAMI</p>
                <p className="text-xl font-black text-gray-900">{order.total}₺</p>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">
                {new Date(order.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
