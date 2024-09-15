import { NavLink, useNavigate } from 'react-router-dom';
import { useApiaries } from '../../hooks/useApiaries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../common';
import localForage from 'localforage';

const MenuItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block py-2 px-4 text-lg transition-colors duration-200 ${
        isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-blue-100'
      }`
    }
  >
    {children}
  </NavLink>
);

const Menu = () => {
  const { data: apiaries, isLoading, error, refetch } = useApiaries();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  //expand this if there's more than one apiary
  const isValidApiariesData = Array.isArray(apiaries) && apiaries.length > 0;
  let APIARY_LINK = '/apiary';
  isValidApiariesData ? (APIARY_LINK = `/apiary/${apiaries[0].id}`) : null;

  const handleLogout = async () => {
    // Clear all data from localForage
    await localForage.clear();
    // Clear all queries from the query cache
    queryClient.clear();
    // Navigate to the login page
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <nav className="bg-white shadow-md rounded-lg overflow-hidden">
        <MenuItem to="/">Dashboard</MenuItem>
        <MenuItem to={APIARY_LINK}>Apiary</MenuItem>
        <MenuItem to="/hives">Hives</MenuItem>
        <MenuItem to="/boxes">Boxes</MenuItem>
        <MenuItem to="/feedings">Feedings</MenuItem>
        <MenuItem to="/inspections">Inspections</MenuItem>
        <MenuItem to="/treatments">Treatments</MenuItem>
        <MenuItem to="/queen">Queen</MenuItem>
        <MenuItem to="/equipment">Equipment</MenuItem>
        <MenuItem to="/settings">Settings</MenuItem>
      </nav>
      <div className="mt-auto p-4">
        <Button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Menu;
