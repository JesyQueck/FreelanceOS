import { useEffect, useState } from 'react';
import { X, MessageCircle } from 'lucide-react';

interface ToastNotificationProps {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'system' | 'alert';
  onClose: (id: string) => void;
  onNavigate?: () => void;
}

export default function ToastNotification({ id, title, message, type, onClose, onNavigate }: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);
    
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Wait for animation to complete
  };

  const getIcon = () => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <div className="w-5 h-5 bg-yellow-500 rounded-full" />;
      case 'alert':
        return <div className="w-5 h-5 bg-red-500 rounded-full" />;
      default:
        return <div className="w-5 h-5 bg-slate-500 rounded-full" />;
    }
  };

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
    handleDismiss();
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm bg-[#151B2B] border border-slate-800/60 rounded-lg shadow-lg p-4
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-white truncate">{title}</h4>
            <button
              onClick={handleDismiss}
              className="ml-2 p-1 hover:bg-slate-800/50 rounded transition-colors"
            >
              <X className="h-3 w-3 text-slate-400" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-2 line-clamp-2">{message}</p>
          {onNavigate && (
            <button
              onClick={handleClick}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              View Message →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
