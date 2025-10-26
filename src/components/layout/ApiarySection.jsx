// src/components/layout/ApiarySection.jsx
import { useState } from 'react';
import ApiaryList from '../../pages/ApiaryList';
import ApiaryForm from '../../pages/ApiaryForm';

const ApiarySection = ({ apiaries, onApiaryCreate, isLoading }) => {
  const [showForm, setShowForm] = useState(false);
  
  const hasApiaries = Array.isArray(apiaries) && apiaries.length > 0;

  const handleCreate = async (newApiary) => {
    await onApiaryCreate(newApiary);
    setShowForm(false);
  };

  return (
    <div className="lg:col-span-2 flex flex-col overflow-hidden">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex-grow overflow-y-auto">
        {isLoading ? (
          <p className="text-gray-500">Loading apiaries...</p>
        ) : hasApiaries ? (
          <ApiaryList apiaries={apiaries} />
        ) : (
          <p className="text-gray-500">No apiaries yet. Create your first one below!</p>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-md p-4">
        {!hasApiaries || showForm ? (
          <ApiaryForm onApiaryCreate={handleCreate} />
        ) : (
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => setShowForm(true)}
          >
            Add New Apiary
          </button>
        )}
      </div>
    </div>
  );
};

export default ApiarySection;