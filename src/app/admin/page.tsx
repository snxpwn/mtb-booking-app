
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AdminDashboard from "@/components/admin-dashboard";
import PinDialog from '@/components/pin-dialog';

const INACTIVITY_TIMEOUT = 1 * 60 * 1000; // 1 minute

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const inactivityTimer = useRef<NodeJS.Timeout>();

    const handleLogout = useCallback(() => {
        setIsAuthenticated(false);
        // Optional: Show a toast notification for logout
    }, []);

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimer.current) {
            clearTimeout(inactivityTimer.current);
        }
        inactivityTimer.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    }, [handleLogout]);

    useEffect(() => {
        if (isAuthenticated) {
            const events = ['mousemove', 'keydown', 'click', 'scroll'];
            events.forEach(event => window.addEventListener(event, resetInactivityTimer));
            resetInactivityTimer(); // Start the timer on initial load

            return () => {
                events.forEach(event => window.removeEventListener(event, resetInactivityTimer));
                if (inactivityTimer.current) {
                    clearTimeout(inactivityTimer.current);
                }
            };
        }
    }, [isAuthenticated, resetInactivityTimer]);

    const handlePinSuccess = () => {
        setIsAuthenticated(true);
    };

  return (
    <>
        {isAuthenticated ? (
            <AdminDashboard />
        ) : (
            <PinDialog onPinSuccess={handlePinSuccess} />
        )}
    </>
  );
}
