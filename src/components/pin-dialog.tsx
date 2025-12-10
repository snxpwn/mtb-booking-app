
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { verifyPin } from '@/app/actions';
import { Loader2 } from 'lucide-react';

interface PinDialogProps {
  onPinSuccess: () => void;
}

export default function PinDialog({ onPinSuccess }: PinDialogProps) {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { success } = await verifyPin(pin);
      if (success) {
        onPinSuccess();
      } else {
        toast({
          variant: 'destructive',
          title: 'Incorrect PIN',
          description: 'Please try again.',
        });
        setPin('');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Could not verify PIN. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>Enter your PIN to view the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="text-center"
              maxLength={4}
              pattern="\d{4}"
              autoFocus
            />
            <Button type="submit" className="w-full" disabled={isLoading || pin.length < 4}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Unlock'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
