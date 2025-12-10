'use client';

import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ChatBubble() {
  const { toast } = useToast();

  const handleClick = () => {
    toast({
      title: '✨ Coming Soon!',
      description:
        'Beauty Bot is currently in training to give you the best service. This feature will be available soon!',
    });
  };

  return (
    <Button
      size="icon"
      className="fixed bottom-24 md:bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 animate-pulse"
      onClick={handleClick}
    >
      <Sparkles className="h-7 w-7" />
    </Button>
  );
}
