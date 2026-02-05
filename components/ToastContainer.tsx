
import React from 'react';
import { Toast } from '../types';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-xl border animate-in slide-in-from-top-4 fade-in duration-300 ${
            toast.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' :
            toast.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
            'bg-blue-50 border-blue-100 text-blue-800'
          }`}
        >
          <div className="flex-shrink-0">
            {toast.type === 'success' && <CheckCircle2 size={20} className="text-green-500" />}
            {toast.type === 'warning' && <AlertCircle size={20} className="text-amber-500" />}
            {toast.type === 'info' && <Info size={20} className="text-blue-500" />}
          </div>
          <p className="text-xs font-black uppercase tracking-tight flex-1">{toast.message}</p>
          <button 
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-black/5 rounded-full transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
