'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ChatSheet from '@/components/chat-sheet';
import { Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Button
        size="icon"
        className={cn(
          "fixed bottom-24 md:bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 transition-transform duration-300 ease-in-out",
          isOpen ? "bg-muted text-muted-foreground scale-90" : "animate-pulse"
        )}
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat assistant"}
      >
        {isOpen ? <X className="h-7 w-7" /> : <Sparkles className="h-7 w-7" />}
      </Button>
      <ChatSheet isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
