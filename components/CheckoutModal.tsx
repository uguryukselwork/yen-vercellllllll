
import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle2, ChevronRight, Smartphone, MessageSquareQuote } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onPaymentSuccess: () => void;
  updateCartItemNote: (id: string, note: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cart, onPaymentSuccess, updateCartItemNote }) => {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onPaymentSuccess();
        setStep('details');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {step === 'details' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Güvenli Ödeme</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Sipariş Özeti</p>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">{item.quantity}x {item.name}</span>
                        <span className="font-bold">{item.price * item.quantity}₺</span>
                      </div>
                      <div className="relative group">
                        <textarea 
                          className="w-full text-[10px] bg-white/50 border border-dashed border-gray-200 rounded-lg p-1.5 outline-none focus:border-orange-300 transition-colors resize-none italic text-gray-500"
                          placeholder="Not ekle..."
                          rows={1}
                          value={item.note || ''}
                          onChange={(e) => updateCartItemNote(item.id, e.target.value)}
                        />
                        <MessageSquareQuote size={10} className="absolute right-1.5 top-1.5 text-gray-300 group-focus-within:text-orange-400" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-800">Toplam</span>
                  <span className="text-xl font-black text-orange-600">{totalPrice}₺</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-bold text-gray-500 ml-1">KART ÜZERİNDEKİ İSİM</span>
                  <input type="text" placeholder="Ad Soyad" className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold text-gray-500 ml-1">KART NUMARASI</span>
                  <div className="relative mt-1">
                    <input type="text" placeholder="**** **** **** ****" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all pl-12 text-sm" />
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label>
                    <span className="text-xs font-bold text-gray-500 ml-1">S.K.T</span>
                    <input type="text" placeholder="MM/YY" className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm" />
                  </label>
                  <label>
                    <span className="text-xs font-bold text-gray-500 ml-1">CVV</span>
                    <input type="text" placeholder="***" className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm" />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-gray-400 justify-center">
                <Lock size={12} /> SSL Sertifikalı 256-bit Güvenli Ödeme
              </div>

              <button 
                onClick={handlePay}
                className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] text-xs uppercase tracking-widest"
              >
                {totalPrice}₺ Öde ve Onayla <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-12 flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
              <Smartphone className="absolute inset-0 m-auto text-orange-500" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Ödeme Onaylanıyor</h3>
              <p className="text-sm text-gray-500 mt-2">Banka ile güvenli bağlantı kuruluyor...</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 scale-110">
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Ödeme Başarılı!</h3>
              <p className="text-sm text-gray-500 mt-2">Siparişiniz mutfağa iletildi. Afiyet olsun!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
