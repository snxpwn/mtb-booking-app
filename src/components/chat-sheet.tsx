
'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, Bot } from 'lucide-react';
import { askAssistant } from '@/app/actions';
import type { Message } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

interface ChatSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ChatSheet({ isOpen, onOpenChange }: ChatSheetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hi! I'm your friendly MTB assistant ✨. How can I help you today? You can ask me about services, policies, or book an appointment.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await askAssistant({
        history: messages,
        prompt: input,
      });

      const modelMessage: Message = { role: 'model', content: response.reply };
      setMessages(prev => [...prev, modelMessage]);

      // Play sound on new message from bot
      audioRef.current?.play().catch(error => console.log("Audio play failed:", error));


    } catch (error) {
      console.error('Error asking assistant:', error);
      const errorMessage: Message = {
        role: 'model',
        content: "Sorry, I'm having a little trouble connecting right now. Please try again in a moment.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="fixed bottom-24 right-6 flex h-[70vh] max-h-[70vh] w-[90vw] max-w-sm flex-col p-0 shadow-2xl rounded-xl border-border md:bottom-24"
        showCloseButton={false}
      >
        <DialogHeader className="p-4 border-b text-center">
          <DialogTitle className="flex items-center justify-center gap-2">
            <Logo className="text-2xl" /> Assistant
          </DialogTitle>
           <DialogDescription>Your friendly guide to beautiful lashes.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1" ref={scrollAreaRef}>
           <div className="p-4 space-y-6">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={cn(
                            'flex items-start gap-3',
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                        >
                        {msg.role === 'model' && (
                            <Avatar className="w-8 h-8 border">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    <Bot size={20} />
                                </AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                            'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                            msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                : 'bg-muted rounded-bl-none'
                            )}
                        >
                            {msg.content}
                        </div>
                        {msg.role === 'user' && (
                             <Avatar className="w-8 h-8 border">
                                <AvatarFallback>
                                    <User size={20} />
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                 {isThinking && (
                    <div className="flex items-start gap-3 justify-start">
                         <Avatar className="w-8 h-8 border">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                <Bot size={20} />
                            </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3">
                            <div className="flex items-center justify-center space-x-1">
                                <span className="h-1.5 w-1.5 bg-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="h-1.5 w-1.5 bg-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="h-1.5 w-1.5 bg-foreground rounded-full animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                )}
           </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background">
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about lashes or bookings..."
              className="pr-12 rounded-full"
              disabled={isThinking}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute top-1/2 right-1 -translate-y-1/2 h-8 w-8 rounded-full"
              onClick={handleSend}
              disabled={isThinking || !input.trim()}
              aria-label="Send message"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
        <audio ref={audioRef} src="data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBvbiBzb25nIEVRIHN0dWRpbwBUQ09QAAAAdgAAA1NvbmcgY3JlYXRlZCBieSB0aGUgbXVzaWMgY29tcG9zZXIgTlJFLCB0aGUgbXVzaWMgY29tcG9zZXIgV0FQUEVSIFBOUyAmIEtFRU4gVENIUE4gZG93bmxvYWQgbGllbnMgYSBvbnRoZSB3ZWJzaXRlIHd3dy5sYXNvb25vdGhlcXVlLm9yZwBUSVQyAAAABgAAAzIyMzU0AFRFRgAAA08AAAAzMXM0YS0yNDI0Yi1zMTM0cy0yNmYyZi0wMGI2YS00NzUyYS00MjAyYS00OTM4YS0xMTE5cy1hYWEwYS0xMmFmMC0xMzM2Zi0xNDIzcy0xNTMxZS0xNjUzYS0xNzM5YS0xODMyczEtMzA0czgtMTEzMi05NDE5bWIAAAAADgAAAzIxNzc4MQBURVNTAAAAGgAAAzIyMzc4MwBURVNUAAAAFAAAAzIyMzg0MwAAAAAATGF2YzU2LjI1LjEwMQAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQAAAAAABASBAUAgAAAAA//uQJAAAABAAAAAAAAA//"
          preload="auto"
        ></audio>
      </DialogContent>
    </Dialog>
  );
}
