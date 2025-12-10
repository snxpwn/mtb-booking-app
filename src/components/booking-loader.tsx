
'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const BlinkingEyelash = () => {
  const [isBlinking, setIsBlinking] = useState(true);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(prev => !prev);
      setTimeout(() => setIsBlinking(true), 200);
    }, 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <div className="relative w-24 h-8">
      <Eye
        className={`absolute top-0 left-0 w-24 h-auto transition-opacity duration-200 ${
          isBlinking ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <EyeOff
        className={`absolute top-0 left-0 w-24 h-auto transition-opacity duration-200 ${
          isBlinking ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};

export default function BookingLoader() {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-[100]">
      <div className="text-center space-y-6">
        <p className="text-muted-foreground text-lg">Confirming your request...</p>
        <div className="flex justify-center pt-4">
          <BlinkingEyelash />
        </div>
      </div>
    </div>
  );
}
