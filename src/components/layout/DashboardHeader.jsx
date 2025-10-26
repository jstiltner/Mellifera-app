import { useAuthContext } from '../../context/AuthContext';
import { useGuestMode } from '../../context/GuestModeContext';
import ThemeToggle from '../common/ThemeToggle';
import { User } from 'lucide-react';

const DashboardHeader = () => {
  const { user } = useAuthContext();
  const { isGuestMode } = useGuestMode();

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-foreground">
            {isGuestMode ? 'Guest' : user?.name || 'Beekeeper'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isGuestMode ? 'Guest Mode' : 'Dashboard'}
          </p>
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
};

export default DashboardHeader;