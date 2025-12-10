
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg animate-in slide-in-from-bottom-5">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground text-center md:text-left">
          <p>
            We use cookie-less analytics to improve your experience. By continuing to use our site, you agree to our{' '}
            <Link href="#policies" className="underline hover:text-primary transition-colors">
              Privacy Policy
            </Link>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={acceptCookies} size="sm" variant="default">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
