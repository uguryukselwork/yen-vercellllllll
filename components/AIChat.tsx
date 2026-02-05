
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import { getAIAssistance } from '../services/geminiService';
import { CartItem } from '../types';

interface AIChatProps {
  cart: CartItem[];
}

export const AIChat: React.FC<AIChatProps> = ({ cart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: "Merhaba! Menümüz hakkında sorularınızı cevaplayabilir veya size özel önerilerde bulunabilirim. Nasıl yardımcı olabilirim?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const cartContext = cart.map(i => `${i.name} x${i.quantity}`).join(", ");
    const response = await getAIAssistance(userMsg, cartContext);
    
    setMessages(prev => [...prev, { role: 'bot', text: response || "Üzgünüm, şu an bağlantı kuramıyorum." }]);
    setIsLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 bg-gray-900 text-white p-4 rounded-full shadow-2xl z-40 transition-transform hover:scale-110 active:scale-95"
      >
        <Bot size={28} />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white animate-in fade-in slide-in-from-bottom-10 sm:inset-auto sm:bottom-24 sm:right-4 sm:w-96 sm:h-[500px] sm:rounded-2xl sm:shadow-2xl sm:border">
          <div className="bg-gray-900 p-4 flex items-center justify-between text-white sm:rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-1.5 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Gurme AI</h3>
                <p className="text-[10px] text-gray-400">Restoran Asistanınız</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-gray-800 p-1 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-orange-500 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 shadow-sm border rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm border">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t sm:rounded-b-2xl">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 border border-gray-200">
              <input 
                type="text" 
                placeholder="Yemek önerisi isteyin..."
                className="flex-1 bg-transparent border-none outline-none text-sm py-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="text-orange-500 disabled:text-gray-300"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
