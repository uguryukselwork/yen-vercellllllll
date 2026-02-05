
import React from 'react';
import { CartItem } from '../types';
import { ShoppingBag, ChevronRight, CreditCard } from 'lucide-react';

interface CartSheetProps {
  cart: CartItem[];
  onOrder: () => void;
  onPay: () => void;
}

export const CartSheet: React.FC<CartSheetProps> = ({ cart, onOrder, onPay }) => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-24 left-0 right-0 p-4 z-40 max-w-2xl mx-auto pointer-events-none">
      <div className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-3 flex items-center justify-between pointer-events-auto transform transition-transform hover:scale-[1.01]">
        
        {/* Left Section: Icon and Price */}
        <div className="flex items-center gap-3 pl-3">
          <div className="relative bg-orange-500 p-3 rounded-2xl text-white shadow-lg shadow-orange-100">
            <ShoppingBag size={22} strokeWidth={2.5} />
            <span className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-md border-2 border-white">
              {totalItems}
            </span>
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">TOPLAM</span>
            <span className="text-2xl font-black tracking-tight text-gray-900">{totalPrice}₺</span>
          </div>
        </div>
        
        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={onOrder}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-md shadow-orange-100 active:scale-95"
          >
            Sipariş Ver <ChevronRight size={16} strokeWidth={3} />
          </button>
          
          <button 
            onClick={onPay}
            className="bg-gray-900 hover:bg-black text-white px-5 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <CreditCard size={16} strokeWidth={2.5} /> Öde
          </button>
        </div>

      </div>
    </div>
  );
};
