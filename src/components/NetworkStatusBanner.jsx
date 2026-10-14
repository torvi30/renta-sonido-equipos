import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 pointer-events-none transition-all duration-300">
      {!isOnline ? (
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-500/90 text-black text-xs sm:text-sm font-bold rounded-2xl shadow-xl backdrop-blur-md border border-amber-300/40 pointer-events-auto animate-pulse">
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <span>Sin conexión a internet. Guardando en modo local seguro.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-500/90 text-black text-xs sm:text-sm font-bold rounded-2xl shadow-xl backdrop-blur-md border border-emerald-300/40 pointer-events-auto">
          <Wifi className="w-4 h-4 flex-shrink-0" />
          <span>Conexión restablecida. Datos sincronizados.</span>
        </div>
      )}
    </div>
  );
}
