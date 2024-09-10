import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import useQueryClientWithAuth from '../hooks/useQueryClientWithAuth';
import ApiaryMap from '../components/ApiaryMap';
import ApiaryDetails from './ApiaryDetails';
import HiveForm from './HiveForm';
import Modal from '../components/Modal';

const ApiaryView = ({ apiaryId }) => {
  const [showHiveForm, setShowHiveForm] = useState(false);
  const queryClient = useQueryClient();
  const authQueryClient = useQueryClientWithAuth();

  const createHiveMutation = useMutation((newHive) => authQueryClient.post('/api/hives', newHive), {
    onSuccess: () => {
      queryClient.invalidateQueries(['apiary', apiaryId]);
      setShowHiveForm(false);
    },
  });

  const handleCreateHive = (hiveData) => {
    createHiveMutation.mutate({ ...hiveData, apiaryId });
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 mb-4 md:mb-0 md:pr-2">
          <ApiaryMap apiaryId={apiaryId} />
        </div>
        <div className="w-full md:w-1/2 md:pl-2">
          <ApiaryDetails apiaryId={apiaryId} />
          <button
            onClick={() => setShowHiveForm(true)}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add New Hive
          </button>
        </div>
      </div>
      <Modal isOpen={showHiveForm} onClose={() => setShowHiveForm(false)}>
        <HiveForm onSubmit={handleCreateHive} apiaries={[{ _id: apiaryId }]} />
      </Modal>
    </div>
  );
};

export default ApiaryView;
