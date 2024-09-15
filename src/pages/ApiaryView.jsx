import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import useQueryClientWithAuth from '../hooks/useQueryClientWithAuth';
import ApiaryMap from '../components/apiary/ApiaryMap';
import ApiaryDetails from './ApiaryDetails';
import HiveForm from './HiveForm';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const ApiaryView = ({ apiaryId }) => {
  const [showHiveForm, setShowHiveForm] = useState(false);
  const queryClient = useQueryClient();
  const authQueryClient = useQueryClientWithAuth();

  const {
    data: apiary,
    isLoading,
    isError,
    error,
  } = useQuery(
    ['apiary', apiaryId],
    () => authQueryClient.get(`/api/apiaries/${apiaryId}`).then((res) => res.data),
    { enabled: !!apiaryId }
  );

  const createHiveMutation = useMutation((newHive) => authQueryClient.post('/api/hives', newHive), {
    onSuccess: () => {
      queryClient.invalidateQueries(['apiary', apiaryId]);
      setShowHiveForm(false);
    },
  });

  const handleCreateHive = (hiveData) => {
    createHiveMutation.mutate({ ...hiveData, apiaryId });
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <ErrorMessage message={error.message || 'An error occurred while fetching the apiary data'} />
    );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 h-[400px] lg:h-full">
          <ApiaryMap apiaries={apiary ? [apiary] : []} />
        </div>
        <div className="w-full lg:w-1/2 p-4 overflow-y-auto">
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
