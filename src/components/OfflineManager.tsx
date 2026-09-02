import { useState, useEffect } from 'react';
import { WifiOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function OfflineManager({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [showOfflinePage, setShowOfflinePage] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    // Initial check
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    const handleOnline = () => {
      setIsOffline(false);
      setReconnecting(true);
      // Brief delay to show "reconnecting..." before hiding the page
      setTimeout(() => {
        setReconnecting(false);
        setShowOfflinePage(false);
      }, 1500);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOffline) {
      // 3 second delay before showing offline page
      timeout = setTimeout(() => {
        setShowOfflinePage(true);
      }, 3000);
    } else {
      // If we come back online before the 3 seconds, the online handler takes care of it,
      // but we should also clear the timeout just in case.
      setShowOfflinePage(false);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isOffline]);

  return (
    <>
      {children}

      <AnimatePresence>
        {showOfflinePage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-red-50 p-6 rounded-full mb-6 text-red-500"
            >
              <WifiOff className="w-12 h-12" />
            </motion.div>
            
            <h2 className="text-2xl font-black text-slate-800 mb-2">You are offline</h2>
            <p className="text-slate-500 max-w-sm mb-8 font-medium">
              It seems there is a problem with your connection. Don't worry, we've saved your progress. 
              The app will automatically resume when you're back online.
            </p>
            
            {reconnecting ? (
              <div className="flex items-center gap-2 text-[#143C6B] font-bold bg-blue-50 px-6 py-3 rounded-full">
                <Loader2 className="w-5 h-5 animate-spin" />
                Reconnecting...
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 font-semibold text-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Waiting for connection
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
