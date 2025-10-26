import { Outlet } from 'react-router-dom';
import VoiceCommander from '../voice/VoiceCommander';
import ErrorBoundary from '../common/ErrorBoundary';

const Layout = () => {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="bg-card border-b border-border p-4">
          <div className="flex justify-between items-center px-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Mellifera</h1>
            <VoiceCommander />
          </div>
        </header>
        <main className="flex-grow w-full">
          <Outlet />
        </main>
        <footer className="bg-card border-t border-border p-4 mt-auto">
          <div className="text-center text-muted-foreground text-sm">
            © {new Date().getFullYear()} Mellifera App
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
