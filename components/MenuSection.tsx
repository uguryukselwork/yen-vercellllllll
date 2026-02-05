
import React, { useState } from 'react';
import { MenuItem, CartItem } from '../types';
import { Plus, Minus, Info, X, ShoppingBag, Tag, MessageSquareQuote, Star, ShieldCheck } from 'lucide-react';

interface MenuSectionProps {
  items: MenuItem[];
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateCartItemNote: (id: string, note: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  'Appetizer': 'Başlangıçlar',
  'Main': 'Ana Yemekler',
  'Drink': 'İçecekler',
  'Dessert': 'Tatlılar'
};

// Helper component for rich text formatting
const RichText = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-bold text-gray-800">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i} className="italic text-gray-700">{part.slice(1, -1)}</em>;
        }
        return part;
      })}
    </>
  );
};

export const MenuSection: React.FC<MenuSectionProps> = ({ items, cart, addToCart, removeFromCart, updateCartItemNote }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');
  const [selectedItemInfo, setSelectedItemInfo] = useState<MenuItem | null>(null);
  
  const categories: string[] = Array.from(new Set(items.map(i => i.category)));
  const displayCategories = selectedCategory === 'All' ? categories : [selectedCategory];

  const getCartItem = (id: string) => cart.find(c => c.id === id);

  return (
    <div className="p-4 space-y-6">
      {/* Category Filter Bar */}
      <div className="sticky top-[68px] z-30 bg-white/95 backdrop-blur-sm -mx-4 px-4 py-3 border-b overflow-x-auto no-scrollbar flex gap-2">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
            selectedCategory === 'All' 
              ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100' 
              : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
          }`}
        >
          Hepsi
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
              selectedCategory === cat 
                ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-100' 
                : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Menu List */}
      <div className="space-y-10">
        {displayCategories.map(category => (
          <div key={category} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-gray-800 tracking-tight">
                {CATEGORY_LABELS[category] || category}
              </h2>
              <div className="flex-1 h-px bg-gray-100"></div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {items.filter(i => i.category === category).map(item => {
                const cartItem = getCartItem(item.id);
                return (
                  <div key={item.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex transition-all hover:shadow-md group">
                    <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden cursor-pointer" onClick={() => setSelectedItemInfo(item)}>
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
                      />
                      {item.tags?.includes('Popüler') && (
                        <div className="absolute top-3 left-3 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg uppercase tracking-tighter">
                          POPÜLER
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="cursor-pointer" onClick={() => setSelectedItemInfo(item)}>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-gray-800 leading-tight group-hover:text-orange-600 transition-colors">{item.name}</h3>
                          <span className="font-black text-orange-600 whitespace-nowrap">{item.price}₺</span>
                        </div>
                        <div className="text-[11px] text-gray-400 line-clamp-2 mt-1 font-medium leading-relaxed">
                          <RichText text={item.description} />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedItemInfo(item)}
                            className={`p-2 rounded-xl transition-all flex items-center gap-1.5 border shadow-sm ${
                              cartItem?.note 
                                ? 'bg-orange-500 text-white border-orange-600' 
                                : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-orange-50 hover:text-orange-500'
                            }`}
                            title={cartItem ? "Not Ekle/Düzenle" : "Detaylar"}
                          >
                            {cartItem ? <MessageSquareQuote size={16} /> : <Info size={16} />}
                            {cartItem && (
                              <span className="text-[9px] font-black uppercase tracking-tighter">
                                {cartItem.note ? 'NOTLU' : 'NOT EKLE'}
                              </span>
                            )}
                          </button>
                        </div>
                        
                        {cartItem ? (
                          <div className="flex items-center gap-3 bg-gray-50 rounded-full px-1.5 py-1 border border-gray-100">
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-full text-orange-500 shadow-sm transition-transform active:scale-90"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-black text-sm min-w-[1.5ch] text-center text-gray-800">{cartItem.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)}
                              className="w-8 h-8 flex items-center justify-center bg-orange-500 rounded-full text-white shadow-sm transition-transform active:scale-90"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => addToCart(item)}
                            className="bg-gray-900 hover:bg-black text-white text-[10px] font-black px-5 py-2.5 rounded-full shadow-lg transition-all active:scale-95 uppercase tracking-widest"
                          >
                            Ekle
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Item Info Modal */}
      {selectedItemInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedItemInfo(null)}>
          <div 
            className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative h-80 sm:h-96">
              <img src={selectedItemInfo.image} alt={selectedItemInfo.name} className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedItemInfo(null)}
                className="absolute top-6 right-6 p-3 bg-white/20 backdrop-blur-xl text-white rounded-full hover:bg-white/40 transition-all active:scale-90 z-20 border border-white/30"
              >
                <X size={24} />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none"></div>
              
              <div className="absolute bottom-8 left-8 right-8 text-white z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-orange-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {CATEGORY_LABELS[selectedItemInfo.category] || selectedItemInfo.category}
                  </span>
                  {selectedItemInfo.tags?.includes('Popüler') && (
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest border border-white/30 flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> Popüler
                    </span>
                  )}
                </div>
                <h2 className="text-4xl font-black tracking-tight leading-none mb-2">{selectedItemInfo.name}</h2>
                <p className="text-3xl font-black text-orange-400">{selectedItemInfo.price}₺</p>
              </div>
            </div>

            <div className="p-8 space-y-8 bg-white relative">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Ürün Detayları</p>
                </div>
                <div className="text-gray-600 leading-relaxed text-base font-medium">
                  <RichText text={selectedItemInfo.description} />
                </div>
              </div>

              {selectedItemInfo.tags && selectedItemInfo.tags.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Özellikler & Etiketler</p>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedItemInfo.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 rounded-2xl text-[11px] font-black uppercase tracking-tight border border-slate-100 shadow-sm">
                        <Tag size={12} className="text-orange-500" /> {tag}
                      </span>
                    ))}
                    <span className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-2xl text-[11px] font-black uppercase tracking-tight border border-green-100 shadow-sm">
                      <ShieldCheck size={12} className="text-green-500" /> Taze Hazırlanmış
                    </span>
                  </div>
                </div>
              )}

              {/* Note field if in cart */}
              {getCartItem(selectedItemInfo.id) && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquareQuote size={14} className="text-orange-500" /> Özel Notunuz
                    </p>
                    <span className="text-[9px] font-bold text-slate-300">İsteğe Bağlı</span>
                  </div>
                  <textarea 
                    autoFocus={!!getCartItem(selectedItemInfo.id)}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all resize-none placeholder:text-slate-400"
                    placeholder="Örn: Tuzsuz olsun, acı istemiyorum..."
                    rows={2}
                    value={getCartItem(selectedItemInfo.id)?.note || ''}
                    onChange={(e) => updateCartItemNote(selectedItemInfo.id, e.target.value)}
                  />
                </div>
              )}

              <div className="pt-2 flex gap-4">
                <button 
                  onClick={() => {
                    if (!getCartItem(selectedItemInfo.id)) addToCart(selectedItemInfo);
                    setSelectedItemInfo(null);
                  }}
                  className="flex-1 bg-gray-900 hover:bg-black text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-gray-400 transition-all active:scale-[0.98] group"
                >
                  <ShoppingBag size={20} className="group-hover:rotate-12 transition-transform" /> 
                  {getCartItem(selectedItemInfo.id) ? 'Kapat ve Kaydet' : 'Sepete Ekle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
