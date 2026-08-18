import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

interface SessionTimeoutManagerProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
  children: React.ReactNode;
}

export function SessionTimeoutManager({
  timeoutMinutes = 15,
  warningMinutes = 1,
  children
}: SessionTimeoutManagerProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(warningMinutes * 60);
  
  const lastActivity = useRef<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetActivity = useCallback(() => {
    lastActivity.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setCountdown(warningMinutes * 60);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
  }, [showWarning, warningMinutes]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
    setShowWarning(false);
  }, [logout, navigate]);

  useEffect(() => {
    // Only track inactivity if a user is logged in
    if (!user) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    
    // Throttle the event listeners to avoid performance issues
    let throttleTimer: NodeJS.Timeout | null = null;
    const handleActivity = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          resetActivity();
          throttleTimer = null;
        }, 1000);
      }
    };

    events.forEach(event => window.addEventListener(event, handleActivity));

    // Check activity every 10 seconds
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const idleTimeMs = now - lastActivity.current;
      
      const timeoutMs = timeoutMinutes * 60 * 1000;
      const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

      if (idleTimeMs >= timeoutMs) {
        handleLogout();
      } else if (idleTimeMs >= warningMs && !showWarning) {
        setShowWarning(true);
        // Start countdown
        setCountdown(warningMinutes * 60);
        countdownIntervalRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, 10000);

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (throttleTimer) clearTimeout(throttleTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [user, timeoutMinutes, warningMinutes, showWarning, resetActivity, handleLogout]);

  return (
    <>
      {children}
      
      {/* Session Timeout Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Session Expiring Soon</h3>
            <p className="text-sm text-gray-500 mb-4">
              You've been inactive for a while. For your security, you will be automatically logged out in 
              <span className="font-bold text-red-600 ml-1">{countdown} seconds</span>.
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Log Out Now
              </button>
              <button
                onClick={resetActivity}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
