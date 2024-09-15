import { Outlet } from 'react-router-dom';
import VoiceCommander from '../voice/VoiceCommander';
import ErrorBoundary from '../common/ErrorBoundary';

const Layout = () => {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="bg-white shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Mellifera</h1>
            <VoiceCommander />
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4">
          <Outlet />
        </main>
        <footer className="bg-white shadow-md p-4 mt-auto">
          <div className="container mx-auto text-center text-gray-600">
            © {new Date().getFullYear()} Mellifera App
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
