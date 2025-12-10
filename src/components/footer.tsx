
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PolicyDialog from '@/components/policy-dialog';

export default function Footer() {
  const [showPolicy, setShowPolicy] = useState(false);

  return (
    <>
      <footer className="bg-black border-t border-zinc-800">
        <div className="container py-6 text-center text-xs text-zinc-400">
          <Button
            variant="link"
            className="text-xs text-zinc-400 hover:text-white"
            onClick={() => setShowPolicy(true)}
          >
            View MTB Policy
          </Button>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} MTB &ndash; Beauty technician
            specialising in eyelash services.
          </p>
          <p className="mt-2">Created by OV1 Studios</p>
        </div>
      </footer>
      <PolicyDialog
        open={showPolicy}
        onOpenChange={setShowPolicy}
        onAccept={() => setShowPolicy(false)}
        onDecline={() => setShowPolicy(false)}
      />
    </>
  );
}
