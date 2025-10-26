/**
 * Guest Mode Button Component
 *
 * Allows users to try the app without creating an account.
 * All data is stored locally and can be synced later.
 */

import { useNavigate } from 'react-router-dom';
import { useGuestMode } from '../../context/GuestModeContext';
import { Button } from '../ui/button';
import { UserCircle, Check } from 'lucide-react';

export default function GuestModeButton() {
  const navigate = useNavigate();
  const { enableGuestMode } = useGuestMode();

  const handleGuestMode = () => {
    enableGuestMode();
    navigate('/'); // Navigate to root (dashboard)
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or try without an account
          </span>
        </div>
      </div>

      <Button
        onClick={handleGuestMode}
        variant="outline"
        className="w-full"
        size="lg"
      >
        <UserCircle className="mr-2 h-5 w-5" />
        Continue as Guest
      </Button>

      <div className="space-y-1 text-xs text-center text-muted-foreground">
        <div className="flex items-center justify-center gap-1">
          <Check className="h-3 w-3 text-green-600" />
          <span>No account required</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <Check className="h-3 w-3 text-green-600" />
          <span>Data stored locally in your browser</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <Check className="h-3 w-3 text-green-600" />
          <span>Create an account later to sync across devices</span>
        </div>
      </div>
    </div>
  );
}